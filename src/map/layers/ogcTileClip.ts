import Feature from 'ol/Feature';
import { Extent } from 'ol/extent';
import {
  Geometry,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
} from 'ol/geom';
import { getTransform, ProjectionLike } from 'ol/proj';
import { Style } from 'ol/style';
import { StyleFunction } from 'ol/style/Style';

// Exact per-tile clipping for vector tiles that OL reprojects. OL clips a
// reprojected source tile to the bbox of its (rotated) footprint, so buffered
// MVT geometry from neighbouring tiles overlaps (double fills) and ring edges
// cut at the tile buffer get stroked (seams). Clipping each tile's features to
// its exact extent in the tile CRS, and stroking only original ring segments,
// makes the tiles join like they do unprojected.

export const OUTLINE_PROPERTY = 'ogc:outline';

type Coord = number[];

// Sutherland–Hodgman against an axis-aligned rectangle
const clipRing = (ring: Coord[], [minX, minY, maxX, maxY]: Extent) => {
  const edges: [(p: Coord) => boolean, (a: Coord, b: Coord) => Coord][] = [
    [(p) => p[0] >= minX, (a, b) => atX(a, b, minX)],
    [(p) => p[0] <= maxX, (a, b) => atX(a, b, maxX)],
    [(p) => p[1] >= minY, (a, b) => atY(a, b, minY)],
    [(p) => p[1] <= maxY, (a, b) => atY(a, b, maxY)],
  ];
  let out = ring;
  for (const [inside, intersect] of edges) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      if (inside(cur)) {
        if (!inside(prev)) out.push(intersect(prev, cur));
        out.push(cur);
      } else if (inside(prev)) {
        out.push(intersect(prev, cur));
      }
    }
    if (out.length === 0) break;
  }
  return out;
};

const atX = (a: Coord, b: Coord, x: number) => [
  x,
  a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]),
];
const atY = (a: Coord, b: Coord, y: number) => [
  a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]),
  y,
];

// Liang–Barsky; null when the segment is outside
const clipSegment = (
  a: Coord,
  b: Coord,
  [minX, minY, maxX, maxY]: Extent,
): [Coord, Coord] | null => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  let t0 = 0;
  let t1 = 1;
  const checks: [number, number][] = [
    [-dx, a[0] - minX],
    [dx, maxX - a[0]],
    [-dy, a[1] - minY],
    [dy, maxY - a[1]],
  ];
  for (const [p, q] of checks) {
    if (p === 0) {
      if (q < 0) return null;
    } else {
      const t = q / p;
      if (p < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
    }
  }
  if (t0 > t1) return null;
  return [
    [a[0] + t0 * dx, a[1] + t0 * dy],
    [a[0] + t1 * dx, a[1] + t1 * dy],
  ];
};

const clipLine = (line: Coord[], extent: Extent) => {
  const pieces: Coord[][] = [];
  let current: Coord[] = [];
  for (let i = 1; i < line.length; i++) {
    const seg = clipSegment(line[i - 1], line[i], extent);
    if (!seg) {
      if (current.length > 1) pieces.push(current);
      current = [];
      continue;
    }
    const last = current[current.length - 1];
    if (last && last[0] === seg[0][0] && last[1] === seg[0][1]) {
      current.push(seg[1]);
    } else {
      if (current.length > 1) pieces.push(current);
      current = [seg[0], seg[1]];
    }
  }
  if (current.length > 1) pieces.push(current);
  return pieces;
};

// Ring edges inside the tile, minus the artificial ones MVT clipping added
// along the tile buffer (they lie outside the tile, so clipLine drops them)
const ringOutline = (ring: Coord[], extent: Extent) =>
  clipLine([...ring, ring[0]], extent);

const clipPolygon = (rings: Coord[][], extent: Extent) => {
  const [outer, ...holes] = rings.map((r) => clipRing(r, extent));
  if (!outer || outer.length < 3) return null;
  return [outer, ...holes.filter((h) => h.length >= 3)].map((r) => [
    ...r,
    r[0],
  ]);
};

const clipGeometry = (geom: Geometry, extent: Extent) => {
  if (geom instanceof Polygon || geom instanceof MultiPolygon) {
    const polygons =
      geom instanceof Polygon ? [geom.getCoordinates()] : geom.getCoordinates();
    const clipped = polygons
      .map((p) => clipPolygon(p, extent))
      .filter((p): p is Coord[][] => p !== null);
    const outline = polygons.flatMap((p) =>
      p.flatMap((r) => ringOutline(r, extent)),
    );
    return clipped.length
      ? {
          geometry: new MultiPolygon(clipped),
          outline: new MultiLineString(outline),
        }
      : null;
  }
  if (geom instanceof LineString || geom instanceof MultiLineString) {
    const lines =
      geom instanceof LineString
        ? [geom.getCoordinates()]
        : geom.getCoordinates();
    const pieces = lines.flatMap((l) => clipLine(l, extent));
    return pieces.length ? { geometry: new MultiLineString(pieces) } : null;
  }
  if (geom instanceof Point || geom instanceof MultiPoint) {
    const [minX, minY, maxX, maxY] = extent;
    const inside = (
      geom instanceof Point ? [geom.getCoordinates()] : geom.getCoordinates()
    ).filter(([x, y]) => x >= minX && x < maxX && y > minY && y <= maxY);
    return inside.length ? { geometry: new MultiPoint(inside) } : null;
  }
  return { geometry: geom };
};

export const clipFeaturesToExtent = (
  features: Feature[],
  extent: Extent,
): Feature[] =>
  features.flatMap((feature) => {
    const geom = feature.getGeometry();
    const clipped = geom && clipGeometry(geom, extent);
    if (!clipped) return [];
    feature.setGeometry(clipped.geometry);
    if (clipped.outline) feature.set(OUTLINE_PROPERTY, clipped.outline);
    return [feature];
  });

// Strokes of polygon features go on the original ring segments, not on the
// clipped polygon (whose tile-edge sides would show as seams). OL reprojects
// only the main geometry, so the outline is transformed here.
export const withOutlineStrokes = (
  base: StyleFunction,
  sourceProjection: ProjectionLike,
  mapProjection: ProjectionLike,
): StyleFunction => {
  const transform = getTransform(sourceProjection, mapProjection);
  // Reprojected features are clones sharing the property's geometry object
  const transformed = new WeakMap<Geometry, Geometry>();
  const toMap = (outline: Geometry) => {
    let geometry = transformed.get(outline);
    if (!geometry) {
      geometry = outline.clone();
      geometry.applyTransform(transform);
      transformed.set(outline, geometry);
    }
    return geometry;
  };

  return (feature, resolution) => {
    const styles = base(feature, resolution);
    const outline = feature.get(OUTLINE_PROPERTY) as Geometry | undefined;
    if (!outline || !styles) return styles;
    return (Array.isArray(styles) ? styles : [styles]).flatMap((style) => {
      const stroke = style.getStroke();
      if (!stroke || style.getText()) return [style];
      const strokeOnly = new Style({
        stroke,
        geometry: toMap(outline),
        zIndex: style.getZIndex(),
      });
      if (!style.getFill()) return [strokeOnly];
      const fillOnly = style.clone();
      fillOnly.setStroke(null);
      return [fillOnly, strokeOnly];
    });
  };
};
