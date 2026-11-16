import type { Map as OlMap } from 'ol';
import Feature from 'ol/Feature';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { unByKey } from 'ol/Observable';
import TileState from 'ol/TileState';
import type VectorTile from 'ol/VectorTile';
import { asArray } from 'ol/color';
import type { Coordinate } from 'ol/coordinate';
import type { EventsKey } from 'ol/events';
import { type Extent, intersects } from 'ol/extent';
import MVT from 'ol/format/MVT';
import type Geometry from 'ol/geom/Geometry';
import type MultiPolygon from 'ol/geom/MultiPolygon';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import {
  equivalent,
  get as getProjection,
  getTransform,
  transformExtent,
} from 'ol/proj';
import type Projection from 'ol/proj/Projection';
import RenderFeature, { toGeometry } from 'ol/render/Feature';
import VectorSource from 'ol/source/Vector';
import VectorTileSource from 'ol/source/VectorTile';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { mapLibreZoomForView } from './mapLibreZoom';

type Properties = Record<string, unknown>;
type Hovered = {
  key: string;
  matches: (properties: Properties) => boolean;
  label: string;
};
type Band = { source: string; minzoom: number; maxzoom?: number };
export type TileJson = { minzoom?: number; maxzoom?: number };

export type HoverKind = 'fill' | 'line' | 'circle';

export type HoverGroup = {
  id: string;
  // One kind for the group, or per archive when they mix points, lines and areas.
  kind: HoverKind | ((source: string) => HoverKind);
  sources: string[];
  sourceLayer: (source: string) => string;
  color: (properties: Properties) => string;
  fillOpacity?: number;
  // Same data at several scales: use one per zoom instead of all of them at once.
  scaleBands?: boolean;
  // MapLibre zoom to start at: dense data (roads, addresses) is only useful close
  // up, and loading its tiles further out costs more than it gives.
  minzoom?: number;
  filter?: (properties: Properties) => boolean;
  // Lower wins when groups overlap.
  rank?: (properties: Properties) => number;
  describe: (properties: Properties, zoom: number) => Hovered;
};

// These tools need the map to themselves: a highlight would cover what's being drawn.
const TOOLS_THAT_PAUSE_HOVER = [
  'draw',
  'measure',
  'extent',
  'hiking',
  'elevationProfile',
];

export const isHoverPaused = (tool: string | null) =>
  tool !== null && TOOLS_THAT_PAUSE_HOVER.includes(tool);

// MapLibre zoom (512 px tiles), the scale the tile archives and bands are cut for.
const FYLKE_MAX_ZOOM = 7;
// Martin's archives are Web Mercator; OL reprojects them to the view, whatever it is.
const TILE_PROJECTION = 'EPSG:3857';
// Parsed tiles kept per source for placing labels: about a few screens' worth.
const REMEMBERED_TILES = 256;
const TRANSPARENT = 'rgba(0,0,0,0)';
// How close the cursor must be to a point symbol, in CSS pixels.
const POINT_HIT_PX = 12;

// Coarse to fine. n100 is skipped: n50 already starts at z9, below its own band.
const PROTECTED_SCALES = ['n5000', 'n2000', 'n1000', 'n500', 'n250', 'n50'];
// In priority order: allmenninger cover whole mountain areas, so what lies inside wins.
const PROTECTED_TYPES = ['Naturvernområde', 'Skytefelt', 'Allmenning'];
const PROTECTED_COLORS: Record<string, string> = {
  Naturvernområde: '#2e7d32',
  Skytefelt: '#c62828',
  Allmenning: '#8d5a2b',
};

const text = (value: unknown) => String(value ?? '').trim();

const byProperty =
  (property: string, value: unknown) => (properties: Properties) =>
    properties[property] === value;

// Tiles carry no usable id (all 0), so name + type is the identity.
export const highlightFilter =
  (objtype: string, navn: string) => (properties: Properties) =>
    properties.objtype === objtype && properties.navn === navn;

export const kindOf = (group: Pick<HoverGroup, 'kind'>, source: string) =>
  typeof group.kind === 'function' ? group.kind(source) : group.kind;

const byLokalid = (p: Properties) => ({
  key: text(p.lokalid),
  matches: (q: Properties) => q.lokalid === p.lokalid,
});

const metres = (value: unknown) =>
  `${Number(value).toLocaleString('nb-NO', { maximumFractionDigits: 1 })} m`;

// Only signposted numbers: kommunal, private and forest road numbers are internal.
const ROAD_PREFIX: Record<string, string> = {
  E: 'E',
  R: 'Rv.',
  F: 'Fv.',
};

const ROAD_TYPES: Record<string, string> = {
  bilferje: 'Bilferje',
  bilveg: 'Veg',
  fortau: 'Fortau',
  gagate: 'Gågate',
  gangfelt: 'Gangfelt',
  gangveg: 'Gangveg',
  gatetun: 'Gatetun',
  sykkelveg: 'Sykkelveg',
  trapp: 'Trapp',
};

export const roadNumber = (p: Properties) => {
  const category = text(p.vegkategori);
  const number = text(p.vegnummer);
  const prefix = ROAD_PREFIX[category];
  if (!prefix || !number) return undefined;
  return `${prefix} ${number}`;
};

const roadType = (p: Properties) => {
  const type = text(p.typeVeg);
  return (
    ROAD_TYPES[type] ?? (type ? type[0].toUpperCase() + type.slice(1) : '')
  );
};

const SEA_HAZARD_KINDS: Record<string, HoverKind> = {
  dybdedata_skjer: 'circle',
  dybdedata_torrfall: 'fill',
  dybdedata_molo: 'line',
};

// Listed in priority order: small targets first, or the areas under them would take every hit.
export const HOVER_GROUPS: HoverGroup[] = [
  {
    id: 'airport',
    kind: 'circle',
    sources: ['n50_bygnanlegg_punkt'],
    sourceLayer: () => 'bygnanlegg_punkt',
    color: () => '#1565c0',
    filter: (p) => p.objtype === 'Lufthavn' && p.navn != null,
    describe: (p) => {
      const codes = [p.iatakode, p.icaokode].map(text).filter(Boolean);
      return {
        key: `airport|${text(p.navn)}`,
        matches: highlightFilter('Lufthavn', text(p.navn)),
        label: codes.length
          ? `${text(p.navn)} (${codes.join(' / ')})`
          : text(p.navn),
      };
    },
  },
  {
    id: 'address',
    kind: 'circle',
    sources: ['matrikkelen_vegadresse'],
    sourceLayer: (source) => source,
    color: () => '#6a1b9a',
    minzoom: 15,
    describe: (p) => ({
      key: `address|${text(p.adressekode)}|${text(p.nummer)}|${text(p.bokstav)}`,
      matches: (q) =>
        q.adressekode === p.adressekode &&
        q.nummer === p.nummer &&
        q.bokstav === p.bokstav,
      label:
        `${text(p.adressenavn)} ${text(p.nummer)}${text(p.bokstav)}`.trim(),
    }),
  },
  {
    id: 'seaHazard',
    kind: (source) => SEA_HAZARD_KINDS[source] ?? 'circle',
    sources: Object.keys(SEA_HAZARD_KINDS),
    sourceLayer: (source) => source,
    color: () => '#bf360c',
    minzoom: 11,
    describe: (p) => ({
      ...byLokalid(p),
      key: `seaHazard|${text(p.lokalid)}`,
      label: text(p.objtype),
    }),
  },
  {
    id: 'shoal',
    kind: 'circle',
    sources: ['dybdedata_grunne'],
    sourceLayer: (source) => source,
    color: () => '#01579b',
    minzoom: 12,
    describe: (p) => ({
      ...byLokalid(p),
      key: `shoal|${text(p.lokalid)}`,
      label: `Grunne ${metres(p.dybde)}`,
    }),
  },
  {
    id: 'depthContour',
    kind: 'line',
    sources: ['dybdedata_dybdekurve'],
    sourceLayer: (source) => source,
    color: () => '#0277bd',
    minzoom: 11,
    // A contour is one depth however many pieces it's drawn in.
    describe: (p) => ({
      key: `depthContour|${text(p.dybde)}`,
      matches: (q) => q.dybde === p.dybde,
      label: `Dybdekurve ${metres(p.dybde)}`,
    }),
  },
  // Soundings are dense: on a contour line the contour wins, between them the sounding.
  {
    id: 'sounding',
    kind: 'circle',
    sources: ['dybdedata_dybdepunkt'],
    sourceLayer: (source) => source,
    color: () => '#01579b',
    minzoom: 13,
    describe: (p) => ({
      ...byLokalid(p),
      key: `sounding|${text(p.lokalid)}`,
      label: `Dybde ${metres(p.dybde)}`,
    }),
  },
  {
    id: 'road',
    kind: 'line',
    sources: ['nvdb_veglenke'],
    sourceLayer: (source) => source,
    color: () => '#e65100',
    minzoom: 12,
    // The whole street (or numbered road) lights up, not just the link under the cursor.
    describe: (p) => {
      const name = text(p.adressenavn);
      const number = roadNumber(p);
      if (name) {
        return {
          key: `road|name|${name}`,
          matches: (q) => q.adressenavn === p.adressenavn,
          label: number ? `${name} (${number})` : name,
        };
      }
      if (number) {
        return {
          key: `road|number|${number}`,
          matches: (q) =>
            q.vegkategori === p.vegkategori && q.vegnummer === p.vegnummer,
          label: number,
        };
      }
      return {
        key: `road|link|${text(p.nvdbId)}`,
        matches: (q) => q.nvdbId === p.nvdbId,
        label: roadType(p),
      };
    },
  },
  {
    id: 'maritime',
    kind: 'line',
    sources: [
      'avtaltavgrensningslinje',
      'avtaltavgrensningslinjesokkel',
      'grense200nautiskemil',
      'lovvirkeomradegrense',
      'tilstotendesone',
      'yttergrensesokkel',
      'yttergrensetilstotendesone',
    ],
    sourceLayer: (source) => source,
    color: () => '#00695c',
    describe: (p) => {
      const name = text(p.virkeomradenavn) || text(p.objtype);
      return {
        key: `maritime|${name}`,
        matches: (q) =>
          text(p.virkeomradenavn ? q.virkeomradenavn : q.objtype) === name,
        label: name,
      };
    },
  },
  {
    id: 'protected',
    kind: 'fill',
    scaleBands: true,
    sources: PROTECTED_SCALES.map((s) => `${s}_restriksjonsomrader_flate`),
    sourceLayer: () => 'restriksjonsomrader_flate',
    color: (p) => PROTECTED_COLORS[text(p.objtype)] ?? '#333333',
    filter: (p) => PROTECTED_TYPES.includes(text(p.objtype)),
    rank: (p) => PROTECTED_TYPES.indexOf(text(p.objtype)),
    describe: (p) => ({
      key: `protected|${text(p.objtype)}|${text(p.navn)}`,
      matches: highlightFilter(text(p.objtype), text(p.navn)),
      label: text(p.navn),
    }),
  },
  {
    id: 'kommune',
    kind: 'fill',
    fillOpacity: 0.12,
    sources: ['n50_adm_kommune_flate'],
    sourceLayer: () => 'adm_kommune_flate',
    color: () => '#37474f',
    // One source for both: zoomed out the same polygons highlight as a whole fylke.
    describe: (p, zoom) =>
      zoom < FYLKE_MAX_ZOOM
        ? {
            key: `fylke|${text(p.fylkesnummer)}`,
            matches: byProperty('fylkesnummer', p.fylkesnummer),
            label: text(p.fylkesnavn),
          }
        : {
            key: `kommune|${text(p.kommunenummer)}`,
            matches: byProperty('kommunenummer', p.kommunenummer),
            label: `${text(p.kommunenavn)} (${text(p.fylkesnavn)})`,
          },
  },
];

export const hoverSources = () => HOVER_GROUPS.flatMap((g) => g.sources);

// One archive per zoom: coarser archives would otherwise be over-zoomed forever,
// so without a maxzoom each pixel would hit a generalized copy of the same area.
export const hoverBands = (
  group: Pick<HoverGroup, 'sources' | 'scaleBands' | 'minzoom'>,
  sources: Record<string, { minzoom?: number }>,
): Band[] => {
  const present = group.sources.filter((source) => source in sources);
  return present.map((source, i) => {
    const next = group.scaleBands ? present[i + 1] : undefined;
    return {
      source,
      minzoom: Math.max(sources[source].minzoom ?? 0, group.minzoom ?? 0),
      ...(next ? { maxzoom: sources[next].minzoom ?? 0 } : {}),
    };
  });
};

export const inBand = (band: Pick<Band, 'minzoom' | 'maxzoom'>, zoom: number) =>
  zoom >= band.minzoom && (band.maxzoom === undefined || zoom < band.maxzoom);

export const pickFeature = <
  T extends { group: HoverGroup; properties: Properties },
>(
  features: T[],
): T | undefined => {
  const score = ({ group, properties }: T) =>
    HOVER_GROUPS.indexOf(group) * 10 + (group.rank?.(properties) ?? 0);
  return [...features].sort((a, b) => score(a) - score(b))[0];
};

const visibleArea = (rings: number[][][], [w, s, e, n]: number[]) => {
  const xs = rings[0].map((c) => c[0]);
  const ys = rings[0].map((c) => c[1]);
  const width = Math.min(e, Math.max(...xs)) - Math.max(w, Math.min(...xs));
  const height = Math.min(n, Math.max(...ys)) - Math.max(s, Math.min(...ys));
  return width > 0 && height > 0 ? width * height : 0;
};

// One label, inside the piece most on screen. Labelling each tile's piece of the
// polygon would repeat it at every tile edge. Falls back to the cursor when none fits.
export const labelPoint = (
  polygons: number[][][][],
  bounds: number[],
  cursor: Coordinate,
): Coordinate => {
  const [w, s, e, n] = bounds;
  let best: number[][][] | undefined;
  let bestArea = 0;
  for (const rings of polygons) {
    const area = visibleArea(rings, bounds);
    if (area > bestArea) {
      best = rings;
      bestArea = area;
    }
  }
  if (!best) return cursor;
  const [x, y] = new Polygon(best).getInteriorPoint().getCoordinates();
  return x >= w && x <= e && y >= s && y <= n ? [x, y] : cursor;
};

type LoadedTile = { z: number; extent: Extent; features: RenderFeature[] };

type HoverSource = {
  id: string;
  kind: HoverKind;
  source: VectorTileSource<RenderFeature>;
  // What has been parsed, in tile projection: the source keeps no public list.
  tiles: Map<string, LoadedTile>;
};

const createHoverSource = (
  martinUrl: string,
  id: string,
  sourceLayer: string,
  kind: HoverKind,
  { minzoom, maxzoom }: TileJson,
  onLoad: (hoverSource: HoverSource) => void,
): HoverSource => {
  const tiles = new Map<string, LoadedTile>();
  const format = new MVT({ layers: [sourceLayer] });
  const source = new VectorTileSource<RenderFeature>({
    format,
    projection: TILE_PROJECTION,
    url: `${martinUrl}/${id}/{z}/{x}/{y}`,
    minZoom: minzoom ?? 0,
    maxZoom: maxzoom ?? 22,
    tileLoadFunction: (tile, url) => {
      const vectorTile = tile as VectorTile<RenderFeature>;
      const load = async (extent: Extent, projection: Projection) => {
        try {
          const response = await fetch(url);
          // Martin answers 204 for a tile with nothing in it.
          if (!response.ok) throw new Error(`${response.status} ${url}`);
          const data = await response.arrayBuffer();
          const features = data.byteLength
            ? (format.readFeatures(data, {
                extent,
                featureProjection: projection,
              }) as RenderFeature[])
            : [];
          vectorTile.setFeatures(features);
          tiles.delete(url);
          tiles.set(url, { z: vectorTile.getTileCoord()[0], extent, features });
          if (tiles.size > REMEMBERED_TILES) {
            tiles.delete(tiles.keys().next().value!);
          }
          onLoad(hoverSource);
        } catch {
          vectorTile.setState(TileState.ERROR);
        }
      };
      vectorTile.setLoader((extent, _resolution, projection) => {
        void load(extent, projection);
      });
    },
  });
  const hoverSource: HoverSource = { id, kind, source, tiles };
  return hoverSource;
};

const hitStyle = (kind: Exclude<HoverKind, 'circle'>): Style => {
  // Invisible but wider than what's drawn: thin lines would be hard to hit. OL hit-detects with an opaque stand-in, so transparent still counts.
  if (kind === 'fill') {
    return new Style({ fill: new Fill({ color: TRANSPARENT }) });
  }
  return new Style({ stroke: new Stroke({ color: TRANSPARENT, width: 14 }) });
};

const withAlpha = (color: string, alpha: number) => {
  const [r, g, b] = asArray(color);
  return [r, g, b, alpha];
};

const highlightStyle = (kind: HoverKind, color: string): Style => {
  // Fills are drawn opaque and faded by the layer instead: each tile's piece of a
  // polygon overlaps its neighbours a little, which a translucent fill would show.
  if (kind === 'fill') return new Style({ fill: new Fill({ color }) });
  if (kind === 'line') {
    return new Style({ stroke: new Stroke({ color, width: 4 }) });
  }
  return new Style({
    image: new Circle({
      radius: 8,
      fill: new Fill({ color: withAlpha(color, 0.35) }),
      stroke: new Stroke({ color, width: 2 }),
    }),
  });
};

type BandLayers = {
  group: HoverGroup;
  band: Band;
  hoverSource: HoverSource;
  hit: VectorTileLayer<VectorTileSource<RenderFeature>>;
};

type Active = {
  hovered: Hovered;
  group: HoverGroup;
  hoverSource: HoverSource;
  color: string;
  point?: Coordinate;
  cursor: Coordinate;
};

const toViewGeometry = (feature: RenderFeature, viewProjection: string) => {
  // toGeometry shares the tile's coordinate array: transforming that in place
  // would reproject the cached tile again on every redraw.
  const geometry = toGeometry(feature.clone());
  if (
    !equivalent(getProjection(TILE_PROJECTION)!, getProjection(viewProjection)!)
  ) {
    geometry.transform(TILE_PROJECTION, viewProjection);
  }
  return geometry;
};

const toPolygons = (geometries: Geometry[]) =>
  geometries.flatMap((geometry) => {
    if (geometry.getType() === 'Polygon') {
      return [(geometry as Polygon).getCoordinates()];
    }
    if (geometry.getType() === 'MultiPolygon') {
      return (geometry as MultiPolygon).getCoordinates();
    }
    return [];
  });

/**
 * The hover highlight, drawn by OpenLayers so it lines up in any view projection:
 * a MapLibre canvas is Web Mercator and can only be fitted to a UTM view at its centre.
 *
 * Hits come from invisible vector tile layers. The highlight itself is the hovered
 * feature's pieces from the loaded tiles, reprojected into a plain vector layer.
 */
export const createHoverLayers = (
  olMap: OlMap,
  martinUrl: string,
  tileJsons: Record<string, TileJson>,
) => {
  let active: Active | undefined;
  let redraw: number | undefined;

  const hoverSources = new Map<string, HoverSource>();
  const sourceFor = (group: HoverGroup, id: string) => {
    let hoverSource = hoverSources.get(id);
    if (!hoverSource) {
      hoverSource = createHoverSource(
        martinUrl,
        id,
        group.sourceLayer(id),
        kindOf(group, id),
        tileJsons[id],
        // More of the hovered feature came in: draw it, once per frame at most.
        (loaded) => {
          if (active?.hoverSource !== loaded) return;
          redraw ??= requestAnimationFrame(() => {
            redraw = undefined;
            drawHighlight();
          });
        },
      );
      hoverSources.set(id, hoverSource);
    }
    return hoverSource;
  };

  const bands: BandLayers[] = [];
  // Lowest priority first, so the first added ends up underneath.
  for (const group of [...HOVER_GROUPS].reverse()) {
    for (const band of hoverBands(group, tileJsons)) {
      const hoverSource = sourceFor(group, band.source);
      // Points are hit-tested from the parsed tiles (findPoints): OL's hit
      // detection misses symbols on vector tile layers. Their layer only loads tiles.
      const style =
        hoverSource.kind === 'circle' ? undefined : hitStyle(hoverSource.kind);
      const hit = new VectorTileLayer({
        source: hoverSource.source,
        style: (feature) =>
          !style || (group.filter && !group.filter(feature.getProperties()))
            ? undefined
            : style,
      });
      bands.push({ group, band, hoverSource, hit });
    }
  }

  const highlightSource = new VectorSource();
  const highlightLayer = new VectorLayer({ source: highlightSource });

  const label = new Feature<Point>();
  const labelLayer = new VectorLayer({
    source: new VectorSource({ features: [label] }),
    style: () => {
      if (!active) return undefined;
      return new Style({
        text: new Text({
          text: active.hovered.label,
          font: 'bold 14px "Noto Sans", Arial, sans-serif',
          fill: new Fill({ color: active.color }),
          stroke: new Stroke({ color: '#ffffff', width: 4 }),
          offsetY: active.point ? -22 : 0,
          overflow: true,
        }),
      });
    },
  });

  const layerGroup = new LayerGroup({
    layers: [...bands.map((b) => b.hit), highlightLayer, labelLayer],
    properties: { id: 'overlay.hover' },
  });
  const hitLayers = new Map(bands.map((b) => [b.hit, b]));

  const zoom = () => {
    const view = olMap.getView();
    return mapLibreZoomForView(view) ?? (view.getZoom() ?? 0) - 1;
  };

  // The tile zoom OL is showing for a source: finer or coarser leftovers in the
  // cache would draw a different outline, or find points twice.
  const sourceZ = ({ source }: HoverSource) => {
    const view = olMap.getView();
    const sourceResolution =
      (view.getResolution()! * view.getProjection().getMetersPerUnit()!) /
      getProjection(TILE_PROJECTION)!.getMetersPerUnit()!;
    return source
      .getTileGrid()!
      .getZForResolution(sourceResolution, source.zDirection);
  };

  // The hovered feature's pieces on screen.
  const activePieces = (viewProjection: string, viewExtent: Extent) => {
    if (!active) return [];
    const { tiles } = active.hoverSource;
    const z = sourceZ(active.hoverSource);
    const tileExtent = transformExtent(
      viewExtent,
      viewProjection,
      TILE_PROJECTION,
    );
    const { matches } = active.hovered;
    return [...tiles.values()]
      .filter((tile) => tile.z === z && intersects(tile.extent, tileExtent))
      .flatMap((tile) =>
        tile.features.filter((f) => matches(f.getProperties())),
      )
      .map((feature) => toViewGeometry(feature, viewProjection));
  };

  const drawHighlight = () => {
    highlightSource.clear();
    if (!active) {
      label.setGeometry(undefined);
      return;
    }
    const { group, hoverSource, color, point, cursor } = active;
    const { kind } = hoverSource;
    const view = olMap.getView();
    const viewProjection = view.getProjection().getCode();
    const viewExtent = view.calculateExtent(olMap.getSize());
    const pieces = point
      ? [new Point(point)]
      : activePieces(viewProjection, viewExtent);

    highlightLayer.setStyle(highlightStyle(kind, color));
    highlightLayer.setOpacity(
      kind === 'fill' ? (group.fillOpacity ?? 0.25) : 1,
    );
    highlightSource.addFeatures(
      pieces.map((geometry) => new Feature({ geometry })),
    );

    const at =
      point ??
      (kind === 'fill'
        ? labelPoint(toPolygons(pieces), viewExtent, cursor)
        : cursor);
    label.setGeometry(new Point(at));
  };

  const clear = () => {
    pending = undefined;
    if (!active) return;
    active = undefined;
    drawHighlight();
  };

  type Candidate = {
    group: HoverGroup;
    hoverSource: HoverSource;
    properties: Properties;
    point?: Coordinate;
  };

  // Points within POINT_HIT_PX of the cursor, nearest first.
  const findPoints = (pixel: number[]): Candidate[] => {
    const view = olMap.getView();
    const viewProjection = view.getProjection().getCode();
    const toView = getTransform(TILE_PROJECTION, viewProjection)!;
    const [x, y] = olMap.getCoordinateFromPixel(pixel);
    const r = POINT_HIT_PX * view.getResolution()!;
    const box = transformExtent(
      [x - r, y - r, x + r, y + r],
      viewProjection,
      TILE_PROJECTION,
    );
    const found: (Candidate & { distance: number })[] = [];
    for (const { group, hoverSource, hit } of bands) {
      if (hoverSource.kind !== 'circle' || !hit.getVisible()) continue;
      const z = sourceZ(hoverSource);
      for (const tile of hoverSource.tiles.values()) {
        if (tile.z !== z || !intersects(tile.extent, box)) continue;
        for (const feature of tile.features) {
          const [fx, fy] = feature.getFlatCoordinates();
          if (fx < box[0] || fx > box[2] || fy < box[1] || fy > box[3]) {
            continue;
          }
          const properties = feature.getProperties();
          if (group.filter && !group.filter(properties)) continue;
          const point = toView([fx, fy]);
          const [px, py] = olMap.getPixelFromCoordinate(point);
          const distance = Math.hypot(px - pixel[0], py - pixel[1]);
          if (distance <= POINT_HIT_PX) {
            found.push({ group, hoverSource, properties, point, distance });
          }
        }
      }
    }
    return found.sort((a, b) => a.distance - b.distance);
  };

  const update = (pixel: number[]) => {
    const candidates: Candidate[] = findPoints(pixel);
    olMap.forEachFeatureAtPixel(
      pixel,
      (feature, layer) => {
        const band = hitLayers.get(
          layer as VectorTileLayer<VectorTileSource<RenderFeature>>,
        );
        if (band) {
          candidates.push({
            group: band.group,
            hoverSource: band.hoverSource,
            properties: feature.getProperties(),
          });
        }
        return undefined;
      },
      {
        layerFilter: (layer) =>
          hitLayers.has(
            layer as VectorTileLayer<VectorTileSource<RenderFeature>>,
          ),
      },
    );
    const picked = pickFeature(candidates);
    if (!picked) return clear();

    const hovered = picked.group.describe(picked.properties, zoom());
    if (active?.hovered.key === hovered.key) return;

    active = {
      hovered,
      group: picked.group,
      hoverSource: picked.hoverSource,
      color: picked.group.color(picked.properties),
      point: picked.point,
      cursor: olMap.getCoordinateFromPixel(pixel),
    };
    drawHighlight();
  };

  // Pointer events outpace rendering: only the latest position each frame matters.
  let pending: number[] | undefined;
  let frame: number | undefined;
  const schedule = (event: unknown) => {
    if (!(event instanceof MapBrowserEvent) || event.dragging) return;
    if (!layerGroup.getVisible()) return;
    pending = event.pixel;
    frame ??= requestAnimationFrame(() => {
      frame = undefined;
      if (pending) update(pending);
    });
  };

  // Bands are cut by Mercator zoom, which in UTM depends on latitude as well as scale.
  const updateBands = () => {
    const z = zoom();
    for (const { band, hit } of bands) hit.setVisible(inBand(band, z));
  };
  let viewKeys: EventsKey[] = [];
  const watchView = () => {
    unByKey(viewKeys);
    const view = olMap.getView();
    viewKeys = [
      view.on('change:resolution', updateBands) as EventsKey,
      view.on('change:center', updateBands) as EventsKey,
    ];
    updateBands();
  };
  watchView();

  const viewport = olMap.getViewport();
  viewport?.addEventListener('mouseleave', clear);
  // singleclick is the only signal on touch screens, which have no hover.
  const keys: EventsKey[] = [
    olMap.on('pointermove', schedule),
    olMap.on('singleclick', schedule),
    olMap.on('moveend', drawHighlight),
    // Projection changes swap in a new view.
    olMap.on('change:view', () => {
      clear();
      watchView();
    }),
    // Switched off with something highlighted: don't leave it behind for the next time.
    layerGroup.on('change:visible', () => {
      if (!layerGroup.getVisible()) clear();
    }),
  ];

  const dispose = () => {
    unByKey(keys);
    unByKey(viewKeys);
    viewport?.removeEventListener('mouseleave', clear);
    if (frame !== undefined) cancelAnimationFrame(frame);
    if (redraw !== undefined) cancelAnimationFrame(redraw);
  };

  return { layer: layerGroup, dispose };
};
