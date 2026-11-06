import type MapLibreLayer from '@geoblocks/ol-maplibre-layer/lib/MapLibreLayer';
import type { Geometry } from 'geojson';
import type {
  FilterSpecification,
  GeoJSONSource,
  LngLatBounds,
  Map as MapLibreMap,
} from 'maplibre-gl';
import type { Map as OlMap } from 'ol';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { unByKey } from 'ol/Observable';
import Polygon from 'ol/geom/Polygon';

const SOURCE_LAYER = 'restriksjonsomrader_flate';
// Coarse to fine. n100 is skipped: n50 already starts at z9, below its own band.
const SCALES = ['n5000', 'n2000', 'n1000', 'n500', 'n250', 'n50'];
const HOVER_TYPES = ['Naturvernområde', 'Allmenning'];
const COLOR_BY_TYPE = ['Naturvernområde', '#2e7d32', '#8d5a2b'];

const LABEL_SOURCE = 'hover-label';
const MATCH_NOTHING: FilterSpecification = ['==', ['get', 'navn'], ''];

type Band = { source: string; minzoom: number; maxzoom?: number };
type LngLat = [number, number];

// One archive per zoom: MapLibre over-zooms the coarser ones forever, so without
// a maxzoom each pixel would hit a generalized copy of the same area.
export const hoverBands = (
  sources: Record<string, { minzoom?: number }>,
): Band[] => {
  const present = SCALES.map((scale) => `${scale}_${SOURCE_LAYER}`).filter(
    (source) => source in sources,
  );
  return present.map((source, i) => {
    const next = present[i + 1];
    return {
      source,
      minzoom: sources[source].minzoom ?? 0,
      ...(next ? { maxzoom: sources[next].minzoom ?? 0 } : {}),
    };
  });
};

// Tiles carry no usable id (all 0), so name + type is the identity.
export const highlightFilter = (
  objtype: string,
  navn: string,
): FilterSpecification => [
  'all',
  ['==', ['get', 'objtype'], objtype],
  ['==', ['get', 'navn'], navn],
];

// Allmenninger cover whole mountain areas, so a reserve inside one wins.
export const pickFeature = <T extends { properties?: Record<string, unknown> }>(
  features: T[],
): T | undefined =>
  features.find((f) => f.properties?.objtype === HOVER_TYPES[0]) ?? features[0];

const visibleArea = (rings: number[][][], [w, s, e, n]: number[]) => {
  const xs = rings[0].map((c) => c[0]);
  const ys = rings[0].map((c) => c[1]);
  const width = Math.min(e, Math.max(...xs)) - Math.max(w, Math.min(...xs));
  const height = Math.min(n, Math.max(...ys)) - Math.max(s, Math.min(...ys));
  return width > 0 && height > 0 ? width * height : 0;
};

// One label, inside the piece most on screen. A symbol layer over the tiles would
// label each tile's piece of the polygon. Falls back to the cursor when none fits.
export const labelPoint = (
  polygons: number[][][][],
  bounds: number[],
  cursor: LngLat,
): LngLat => {
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

const toPolygons = (features: { geometry: Geometry }[]): number[][][][] =>
  features.flatMap((f) => {
    if (f.geometry.type === 'Polygon') return [f.geometry.coordinates];
    if (f.geometry.type === 'MultiPolygon') return f.geometry.coordinates;
    return [];
  });

const toBbox = (b: LngLatBounds) => [
  b.getWest(),
  b.getSouth(),
  b.getEast(),
  b.getNorth(),
];

const addLayers = (ml: MapLibreMap, bands: Band[]) => {
  // Above every painted layer but under the labels, which the style emits last.
  // Icons are symbol layers too and start near the bottom, so match on text.
  const firstLabel = ml
    .getStyle()
    .layers.find((l) => l.type === 'symbol' && l.layout?.['text-field'])?.id;
  const filter: FilterSpecification = [
    'in',
    ['get', 'objtype'],
    ['literal', HOVER_TYPES],
  ];
  const color = ['match', ['get', 'objtype'], ...COLOR_BY_TYPE] as never;

  for (const { source, minzoom, maxzoom } of bands) {
    const common = {
      source,
      'source-layer': SOURCE_LAYER,
      minzoom,
      ...(maxzoom === undefined ? {} : { maxzoom }),
    };
    // The style only draws outlines here, so this is what makes the inside hoverable.
    ml.addLayer(
      {
        ...common,
        id: `hover-hit-${source}`,
        type: 'fill',
        filter,
        paint: { 'fill-opacity': 0 },
      },
      firstLabel,
    );
    ml.addLayer(
      {
        ...common,
        id: `hover-fill-${source}`,
        type: 'fill',
        filter: MATCH_NOTHING,
        paint: { 'fill-color': color, 'fill-opacity': 0.25 },
      },
      firstLabel,
    );
    ml.addLayer(
      {
        ...common,
        id: `hover-line-${source}`,
        type: 'line',
        filter: MATCH_NOTHING,
        paint: { 'line-color': color, 'line-width': 2 },
      },
      firstLabel,
    );
  }

  ml.addSource(LABEL_SOURCE, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });
  ml.addLayer({
    id: LABEL_SOURCE,
    type: 'symbol',
    source: LABEL_SOURCE,
    layout: {
      'text-field': ['get', 'navn'],
      'text-font': ['Noto Sans Bold'],
      'text-size': 14,
      'text-max-width': 12,
      'text-allow-overlap': true,
      'text-ignore-placement': true,
    },
    paint: {
      'text-color': ['match', ['get', 'objtype'], ...COLOR_BY_TYPE] as never,
      'text-halo-color': '#ffffff',
      'text-halo-width': 2,
    },
  });
};

const attachHover = (ml: MapLibreMap, olMap: OlMap, bands: Band[]) => {
  const hitLayers = bands.map(({ source }) => `hover-hit-${source}`);
  let active: { key: string; filter: FilterSpecification } | undefined;
  let cursor: LngLat = [0, 0];
  let source: string | undefined;
  let properties = {};
  let pending: number[] | undefined;
  let frame: number | undefined;

  const setHighlight = (filter: FilterSpecification) => {
    for (const band of bands) {
      ml.setFilter(`hover-fill-${band.source}`, filter);
      ml.setFilter(`hover-line-${band.source}`, filter);
    }
  };

  const moveLabel = () => {
    const label = ml.getSource(LABEL_SOURCE) as GeoJSONSource | undefined;
    if (!active || !source) {
      label?.setData({ type: 'FeatureCollection', features: [] });
      return;
    }
    const pieces = ml.querySourceFeatures(source, {
      sourceLayer: SOURCE_LAYER,
      filter: active.filter,
    });
    label?.setData({
      type: 'Feature',
      properties,
      geometry: {
        type: 'Point',
        coordinates: labelPoint(
          toPolygons(pieces),
          toBbox(ml.getBounds()),
          cursor,
        ),
      },
    });
  };

  const clear = () => {
    pending = undefined;
    if (!active) return;
    active = undefined;
    setHighlight(MATCH_NOTHING);
    moveLabel();
    olMap.render();
  };

  const update = (pixel: number[]) => {
    const [x, y] = pixel;
    const feature = pickFeature(
      ml.queryRenderedFeatures([x, y], { layers: hitLayers }),
    );
    if (!feature) return clear();

    const objtype = String(feature.properties.objtype);
    const navn = String(feature.properties.navn);
    const key = `${objtype}|${navn}`;
    if (active?.key === key) return;

    const { lng, lat } = ml.unproject([x, y]);
    cursor = [lng, lat];
    source = feature.source;
    // Rendered features' properties have no prototype, which the worker can't serialize.
    properties = { objtype, navn };
    active = { key, filter: highlightFilter(objtype, navn) };
    setHighlight(active.filter);
    moveLabel();
    olMap.render();
  };

  // Pointer events outpace rendering: only the latest position each frame matters.
  // The canvas is what the user sees, so query by pixel, not by map coordinate.
  const schedule = (event: unknown) => {
    if (!(event instanceof MapBrowserEvent) || event.dragging) return;
    pending = event.pixel;
    frame ??= requestAnimationFrame(() => {
      frame = undefined;
      if (pending) update(pending);
    });
  };

  const viewport = olMap.getViewport();
  viewport?.addEventListener('mouseleave', clear);
  // singleclick is the only signal on touch screens, which have no hover.
  const keys = [
    olMap.on('pointermove', schedule),
    olMap.on('singleclick', schedule),
    olMap.on('moveend', moveLabel),
  ];

  return () => {
    unByKey(keys);
    viewport?.removeEventListener('mouseleave', clear);
    if (frame !== undefined) cancelAnimationFrame(frame);
  };
};

export const enableTopoVectorHover = (layer: MapLibreLayer) => {
  let detach: (() => void) | undefined;

  // setMapInternal(null) disposes the MapLibre map, but the OL listeners outlive it.
  layer.on('propertychange', (event) => {
    if (event.key === 'map' && !layer.getMapInternal()) detach?.();
  });

  layer.once('load' as never, () => {
    const ml = layer.mapLibreMap;
    const olMap = layer.getMapInternal();
    if (!ml || !olMap) return;

    const bands = hoverBands(
      ml.getStyle().sources as Record<string, { minzoom?: number }>,
    );
    if (bands.length === 0) return;
    addLayers(ml, bands);
    detach = attachHover(ml, olMap, bands);
  });
};
