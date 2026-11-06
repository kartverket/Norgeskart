import type MapLibreLayer from '@geoblocks/ol-maplibre-layer/lib/MapLibreLayer';
import type { Geometry } from 'geojson';
import type {
  ExpressionSpecification,
  FilterSpecification,
  GeoJSONSource,
  LngLatBounds,
  Map as MapLibreMap,
} from 'maplibre-gl';
import type { Map as OlMap } from 'ol';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { unByKey } from 'ol/Observable';
import Polygon from 'ol/geom/Polygon';

type Properties = Record<string, unknown>;
type Hovered = { key: string; filter: FilterSpecification; label: string };
type LngLat = [number, number];
type Band = { source: string; minzoom: number; maxzoom?: number };

type HoverGroup = {
  id: string;
  kind: 'fill' | 'line' | 'circle';
  sources: string[];
  sourceLayer: (source: string) => string;
  color: string | ExpressionSpecification;
  labelColor: (properties: Properties) => string;
  fillOpacity?: number;
  // Same data at several scales: use one per zoom instead of all of them at once.
  scaleBands?: boolean;
  filter?: FilterSpecification;
  // Lower wins when groups overlap.
  rank?: (properties: Properties) => number;
  describe: (properties: Properties, zoom: number) => Hovered;
};

const LABEL_SOURCE = 'hover-label';
const MATCH_NOTHING: FilterSpecification = ['==', ['get', 'hover-none'], 1];
const FYLKE_MAX_ZOOM = 7;

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

const byProperty = (property: string, value: unknown): FilterSpecification => [
  '==',
  ['get', property],
  value as string,
];

// Tiles carry no usable id (all 0), so name + type is the identity.
export const highlightFilter = (
  objtype: string,
  navn: string,
): FilterSpecification => [
  'all',
  ['==', ['get', 'objtype'], objtype],
  ['==', ['get', 'navn'], navn],
];

// Listed in priority order: small targets first, or the areas under them would take every hit.
export const HOVER_GROUPS: HoverGroup[] = [
  {
    id: 'airport',
    kind: 'circle',
    sources: ['n50_bygnanlegg_punkt'],
    sourceLayer: () => 'bygnanlegg_punkt',
    color: '#1565c0',
    labelColor: () => '#1565c0',
    filter: ['all', ['==', ['get', 'objtype'], 'Lufthavn'], ['has', 'navn']],
    describe: (p) => {
      const codes = [p.iatakode, p.icaokode].map(text).filter(Boolean);
      return {
        key: `airport|${text(p.navn)}`,
        filter: highlightFilter('Lufthavn', text(p.navn)),
        label: codes.length
          ? `${text(p.navn)} (${codes.join(' / ')})`
          : text(p.navn),
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
    color: '#00695c',
    labelColor: () => '#00695c',
    describe: (p) => {
      const name = text(p.virkeomradenavn) || text(p.objtype);
      return {
        key: `maritime|${name}`,
        filter: byProperty(
          p.virkeomradenavn ? 'virkeomradenavn' : 'objtype',
          name,
        ),
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
    color: [
      'match',
      ['get', 'objtype'],
      ...Object.entries(PROTECTED_COLORS).slice(0, -1).flat(),
      PROTECTED_COLORS.Allmenning,
    ] as unknown as ExpressionSpecification,
    labelColor: (p) => PROTECTED_COLORS[text(p.objtype)] ?? '#333333',
    filter: ['in', ['get', 'objtype'], ['literal', PROTECTED_TYPES]],
    rank: (p) => PROTECTED_TYPES.indexOf(text(p.objtype)),
    describe: (p) => ({
      key: `protected|${text(p.objtype)}|${text(p.navn)}`,
      filter: highlightFilter(text(p.objtype), text(p.navn)),
      label: text(p.navn),
    }),
  },
  {
    id: 'kommune',
    kind: 'fill',
    fillOpacity: 0.12,
    sources: ['n50_adm_kommune_flate'],
    sourceLayer: () => 'adm_kommune_flate',
    color: '#37474f',
    labelColor: () => '#37474f',
    // One source for both: zoomed out the same polygons highlight as a whole fylke.
    describe: (p, zoom) =>
      zoom < FYLKE_MAX_ZOOM
        ? {
            key: `fylke|${text(p.fylkesnummer)}`,
            filter: byProperty('fylkesnummer', p.fylkesnummer),
            label: text(p.fylkesnavn),
          }
        : {
            key: `kommune|${text(p.kommunenummer)}`,
            filter: byProperty('kommunenummer', p.kommunenummer),
            label: `${text(p.kommunenavn)} (${text(p.fylkesnavn)})`,
          },
  },
];

export const hoverSources = () => HOVER_GROUPS.flatMap((g) => g.sources);

// One archive per zoom: MapLibre over-zooms the coarser ones forever, so without
// a maxzoom each pixel would hit a generalized copy of the same area.
export const hoverBands = (
  group: Pick<HoverGroup, 'sources' | 'scaleBands'>,
  sources: Record<string, { minzoom?: number }>,
): Band[] => {
  const present = group.sources.filter((source) => source in sources);
  return present.map((source, i) => {
    const next = group.scaleBands ? present[i + 1] : undefined;
    return {
      source,
      minzoom: sources[source].minzoom ?? 0,
      ...(next ? { maxzoom: sources[next].minzoom ?? 0 } : {}),
    };
  });
};

const hitLayer = (group: HoverGroup, source: string) =>
  `hover-hit-${group.id}-${source}`;

const groupOf = (layerId: string) =>
  HOVER_GROUPS.find((g) => layerId.startsWith(`hover-hit-${g.id}-`));

export const pickFeature = <
  T extends { layer: { id: string }; properties: Properties },
>(
  features: T[],
): T | undefined => {
  const score = (feature: T) => {
    const group = groupOf(feature.layer.id);
    if (!group) return Infinity;
    return (
      HOVER_GROUPS.indexOf(group) * 10 + (group.rank?.(feature.properties) ?? 0)
    );
  };
  return [...features].sort((a, b) => score(a) - score(b))[0];
};

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

const addGroupLayers = (
  ml: MapLibreMap,
  group: HoverGroup,
  { source, minzoom, maxzoom }: Band,
  beforeId?: string,
) => {
  const common = {
    source,
    'source-layer': group.sourceLayer(source),
    minzoom,
    ...(maxzoom === undefined ? {} : { maxzoom }),
  };
  const hit = {
    ...common,
    id: hitLayer(group, source),
    ...(group.filter ? { filter: group.filter } : {}),
  };
  const shown = { ...common, filter: MATCH_NOTHING };
  const id = `${group.id}-${source}`;

  // Invisible but wider than what's drawn: the style's thin lines and small
  // points would be hard to hit, and it only outlines areas.
  if (group.kind === 'fill') {
    ml.addLayer(
      { ...hit, type: 'fill', paint: { 'fill-opacity': 0 } },
      beforeId,
    );
    ml.addLayer(
      {
        ...shown,
        id: `hover-fill-${id}`,
        type: 'fill',
        paint: {
          'fill-color': group.color,
          'fill-opacity': group.fillOpacity ?? 0.25,
        },
      },
      beforeId,
    );
  }
  if (group.kind === 'circle') {
    ml.addLayer(
      {
        ...hit,
        type: 'circle',
        paint: { 'circle-radius': 12, 'circle-opacity': 0 },
      },
      beforeId,
    );
    ml.addLayer(
      {
        ...shown,
        id: `hover-fill-${id}`,
        type: 'circle',
        paint: {
          'circle-radius': 8,
          'circle-color': group.color,
          'circle-opacity': 0.35,
          'circle-stroke-color': group.color,
          'circle-stroke-width': 2,
        },
      },
      beforeId,
    );
    return;
  }
  if (group.kind === 'line') {
    ml.addLayer(
      {
        ...hit,
        type: 'line',
        paint: { 'line-width': 14, 'line-opacity': 0 },
      },
      beforeId,
    );
  }
  ml.addLayer(
    {
      ...shown,
      id: `hover-line-${id}`,
      type: 'line',
      paint: {
        'line-color': group.color,
        'line-width': group.kind === 'line' ? 4 : 2,
      },
    },
    beforeId,
  );
};

const addLayers = (ml: MapLibreMap, bands: Map<HoverGroup, Band[]>) => {
  // Lowest priority first, so the first added ends up underneath.
  for (const group of [...HOVER_GROUPS].reverse()) {
    for (const band of bands.get(group) ?? []) addGroupLayers(ml, group, band);
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
      'text-field': ['get', 'label'],
      'text-font': ['Noto Sans Bold'],
      'text-size': 14,
      'text-max-width': 14,
      'text-allow-overlap': true,
      'text-ignore-placement': true,
      'text-offset': [
        'case',
        ['get', 'above'],
        ['literal', [0, -1.6]],
        ['literal', [0, 0]],
      ],
    },
    paint: {
      'text-color': ['get', 'color'],
      'text-halo-color': '#ffffff',
      'text-halo-width': 2,
    },
  });
};

const attachHover = (
  ml: MapLibreMap,
  olMap: OlMap,
  bands: Map<HoverGroup, Band[]>,
) => {
  const hitLayers = [...bands].flatMap(([group, list]) =>
    list.map(({ source }) => hitLayer(group, source)),
  );
  const shownLayers = (group: HoverGroup) =>
    (bands.get(group) ?? []).flatMap(({ source }) =>
      ['fill', 'line']
        .map((part) => `hover-${part}-${group.id}-${source}`)
        .filter((id) => ml.getLayer(id)),
    );

  let active:
    | {
        hovered: Hovered;
        group: HoverGroup;
        source: string;
        color: string;
        point?: LngLat;
      }
    | undefined;
  let cursor: LngLat = [0, 0];
  let pending: number[] | undefined;
  let frame: number | undefined;

  const setFilter = (group: HoverGroup, filter: FilterSpecification) => {
    for (const id of shownLayers(group)) ml.setFilter(id, filter);
  };

  const moveLabel = () => {
    const label = ml.getSource(LABEL_SOURCE) as GeoJSONSource | undefined;
    if (!active) {
      label?.setData({ type: 'FeatureCollection', features: [] });
      return;
    }
    const { group, source, hovered, color, point } = active;
    const coordinates =
      point ??
      (group.kind === 'fill'
        ? labelPoint(
            toPolygons(
              ml.querySourceFeatures(source, {
                sourceLayer: group.sourceLayer(source),
                filter: hovered.filter,
              }),
            ),
            toBbox(ml.getBounds()),
            cursor,
          )
        : cursor);
    label?.setData({
      type: 'Feature',
      properties: { label: hovered.label, color, above: Boolean(point) },
      geometry: { type: 'Point', coordinates },
    });
  };

  const clear = () => {
    pending = undefined;
    if (!active) return;
    setFilter(active.group, MATCH_NOTHING);
    active = undefined;
    moveLabel();
    olMap.render();
  };

  const update = (pixel: number[]) => {
    const [x, y] = pixel;
    const feature = pickFeature(
      ml.queryRenderedFeatures([x, y], { layers: hitLayers }),
    );
    const group = feature && groupOf(feature.layer.id);
    if (!feature || !group) return clear();

    const hovered = group.describe(feature.properties, ml.getZoom());
    if (active?.hovered.key === hovered.key) return;

    if (active && active.group !== group) {
      setFilter(active.group, MATCH_NOTHING);
    }
    const { lng, lat } = ml.unproject([x, y]);
    cursor = [lng, lat];
    active = {
      hovered,
      group,
      source: feature.source,
      // Rendered features' properties can't be sent to the worker, so copy what's used.
      color: group.labelColor(feature.properties),
      point:
        feature.geometry.type === 'Point'
          ? (feature.geometry.coordinates.slice(0, 2) as LngLat)
          : undefined,
    };
    setFilter(group, hovered.filter);
    moveLabel();
    olMap.render();
  };

  // Pointer events outpace rendering: only the latest position each frame matters.
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

export const enableHover = (layer: MapLibreLayer) => {
  let detach: (() => void) | undefined;

  // setMapInternal(null) disposes the MapLibre map, but the OL listeners outlive it.
  layer.on('propertychange', (event) => {
    if (event.key === 'map' && !layer.getMapInternal()) detach?.();
  });

  layer.once('load' as never, () => {
    const ml = layer.mapLibreMap;
    const olMap = layer.getMapInternal();
    if (!ml || !olMap) return;

    const sources = ml.getStyle().sources as Record<
      string,
      { minzoom?: number }
    >;
    const bands = new Map(
      HOVER_GROUPS.map((group) => [group, hoverBands(group, sources)]),
    );
    addLayers(ml, bands);
    detach = attachHover(ml, olMap, bands);
  });
};
