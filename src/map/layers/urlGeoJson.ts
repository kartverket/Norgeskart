import { atom } from 'jotai';
import { Feature } from 'ol';
import type { FeatureLike } from 'ol/Feature';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';

// ---------------------------------------------------------------------------
// Default style: semi-transparent blue fill + 2px stroke
// ---------------------------------------------------------------------------

const DEFAULT_FILL_COLOR = 'rgba(51, 153, 204, 0.2)';
const DEFAULT_STROKE_COLOR = '#3399cc';
const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_POINT_RADIUS = 6;

const defaultStyle = new Style({
  fill: new Fill({ color: DEFAULT_FILL_COLOR }),
  stroke: new Stroke({ color: DEFAULT_STROKE_COLOR, width: DEFAULT_STROKE_WIDTH }),
  image: new CircleStyle({
    radius: DEFAULT_POINT_RADIUS,
    fill: new Fill({ color: DEFAULT_FILL_COLOR }),
    stroke: new Stroke({ color: DEFAULT_STROKE_COLOR, width: DEFAULT_STROKE_WIDTH }),
  }),
});

// ---------------------------------------------------------------------------
// simplestyle-spec v1.1 helpers
// ---------------------------------------------------------------------------

const SIMPLESTYLE_KEYS = new Set([
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-opacity',
  'stroke-width',
  'marker-color',
  'marker-size',
  'marker-symbol',
]);

/** Convert a hex colour + alpha value into an `rgba(…)` string. */
const hexToRgba = (hex: string, alpha: number): string => {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(51,153,204,${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const hasSimplestyle = (props: Record<string, unknown>): boolean =>
  [...SIMPLESTYLE_KEYS].some((k) => k in props);

const markerSizeToRadius = (size: unknown): number => {
  if (size === 'small') return 4;
  if (size === 'large') return 8;
  return 6; // medium (default)
};

/**
 * Per-feature style function implementing simplestyle-spec v1.1.
 * Falls back to the default blue style when no simplestyle properties are found.
 *
 * Supported properties: fill, fill-opacity, stroke, stroke-opacity, stroke-width,
 * marker-color, marker-size. marker-symbol is not yet supported.
 */
export const simplestyleToOlStyle = (
  feature: FeatureLike,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _resolution?: number,
): Style => {
  const props = feature.getProperties() as Record<string, unknown>;

  if (!hasSimplestyle(props)) {
    return defaultStyle;
  }

  const fillHex =
    typeof props['fill'] === 'string' ? props['fill'] : DEFAULT_STROKE_COLOR;
  const fillOpacity =
    typeof props['fill-opacity'] === 'number' ? props['fill-opacity'] : 0.2;
  const strokeHex =
    typeof props['stroke'] === 'string'
      ? props['stroke']
      : DEFAULT_STROKE_COLOR;
  const strokeOpacity =
    typeof props['stroke-opacity'] === 'number'
      ? props['stroke-opacity']
      : 1.0;
  const strokeWidth =
    typeof props['stroke-width'] === 'number'
      ? props['stroke-width']
      : DEFAULT_STROKE_WIDTH;
  const markerHex =
    typeof props['marker-color'] === 'string'
      ? props['marker-color']
      : DEFAULT_STROKE_COLOR;

  const fillRgba = hexToRgba(fillHex, fillOpacity);
  const strokeRgba =
    strokeOpacity === 1.0 ? strokeHex : hexToRgba(strokeHex, strokeOpacity);

  const geomType = feature.getGeometry()?.getType();

  if (geomType === 'Point' || geomType === 'MultiPoint') {
    return new Style({
      image: new CircleStyle({
        radius: markerSizeToRadius(props['marker-size']),
        fill: new Fill({ color: hexToRgba(markerHex, 1.0) }),
        stroke: new Stroke({ color: strokeRgba, width: 1 }),
      }),
    });
  }

  if (geomType === 'LineString' || geomType === 'MultiLineString') {
    return new Style({
      stroke: new Stroke({ color: strokeRgba, width: strokeWidth }),
    });
  }

  // Polygon, MultiPolygon, and catch-all
  return new Style({
    fill: new Fill({ color: fillRgba }),
    stroke: new Stroke({ color: strokeRgba, width: strokeWidth }),
  });
};

// ---------------------------------------------------------------------------
// Layer factory
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// dekningsstatus styling
//
// GeoJSON files whose URL filename starts with 'dekning_' come from Geonorge's
// fullstendighetsdekningskart pipeline. They are recognised automatically and
// styled by their 'dekningsstatus' property using the official colour scheme.
// ---------------------------------------------------------------------------

const DEKNINGSSTATUS_COLORS: Record<string, string> = {
  fullstendig: '#a6d388',
  ufullstendig: '#e8d38a',
  ikkeKartlagt: '#f09c5a',
  ikkeRelevant: '#b4b4b4',
};

export const dekningsstatusToOlStyle = (feature: FeatureLike): Style => {
  const status = feature.get('dekningsstatus') as string | undefined;
  const hex =
    (status !== undefined && DEKNINGSSTATUS_COLORS[status]) ||
    DEFAULT_STROKE_COLOR;
  return new Style({
    fill: new Fill({ color: hexToRgba(hex, 0.5) }),
    stroke: new Stroke({ color: hex, width: 2 }),
  });
};

/** Returns true when a URL points to a Geonorge dekning GeoJSON file. */
const isDekningUrl = (url: string): boolean => {
  const filename =
    url
      .split('?')[0] // strip query string
      .split('/')
      .pop() ?? '';
  return filename.toLowerCase().startsWith('dekning_');
};

// ---------------------------------------------------------------------------

/** Derive a human-readable title from a GeoJSON URL. */
const titleFromUrl = (url: string, index: number): string => {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop() ?? '';
    if (filename) {
      return filename
        .replace(/\.geojson$/i, '')
        .replace(/[_-]/g, ' ')
        .trim();
    }
  } catch {
    // URL parsing failed — fall through to default
  }
  return `GeoJSON ${index + 1}`;
};

/**
 * Create an OpenLayers VectorLayer that loads GeoJSON from a URL.
 *
 * The layer is assigned id `theme.urlGeojson.<index>` so it is automatically
 * picked up by `getVisibleVectorLayers()` / `getVectorFeaturesAtPixel()` in
 * featureInfoService.ts — GetFeatureInfo on click works without any extra code.
 *
 * Style selection (highest priority first):
 * 1. URL filename starts with `dekning_` → styled by `dekningsstatus` property
 *    using the official Geonorge fullstendighetsdekningskart colour scheme.
 * 2. Features contain simplestyle-spec v1.1 properties → per-feature styling.
 * 3. Neither → default semi-transparent blue style.
 *
 * The loader reads the GeoJSON file's `crs` member (if present) to determine
 * `dataProjection`, falling back to EPSG:4326. This handles both standard
 * GeoJSON (EPSG:4326) and Kartverket files in EPSG:25833.
 */
export const createUrlGeoJsonLayer = async (
  geojsonUrl: string,
  mapProjection: string,
  index: number,
): Promise<VectorLayer<VectorSource<Feature<Geometry>>>> => {
  console.log('[urlGeoJson] fetching:', geojsonUrl);
  const res = await fetch(geojsonUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${geojsonUrl}`);

  const geojsonData = (await res.json()) as {
    crs?: { properties?: { name?: string } };
    [k: string]: unknown;
  };

  // Detect dataProjection from the GeoJSON crs member (GeoJSON 1.0 / Kartverket convention)
  const crsName = geojsonData?.crs?.properties?.name;
  let dataProjection = 'EPSG:4326'; // RFC 7946 default
  if (crsName) {
    // Normalise "urn:ogc:def:crs:EPSG::25833" or plain "EPSG:25833" → "EPSG:25833"
    const match = /EPSG[::]+(\d+)/.exec(crsName);
    if (match) dataProjection = `EPSG:${match[1]}`;
  }
  console.log('[urlGeoJson] dataProjection:', dataProjection, 'featureProjection:', mapProjection);

  const format = new GeoJSON({ dataProjection, featureProjection: mapProjection });
  const features = format.readFeatures(geojsonData) as Feature<Geometry>[];
  console.log('[urlGeoJson] loaded', features.length, 'features from', geojsonUrl);

  const vectorSource = new VectorSource<Feature<Geometry>>({ features });
  console.log('[urlGeoJson] source extent:', vectorSource.getExtent());

  const styleFn = isDekningUrl(geojsonUrl)
    ? dekningsstatusToOlStyle
    : simplestyleToOlStyle;

  return new VectorLayer({
    source: vectorSource,
    style: styleFn,
    zIndex: 10,
    properties: {
      id: `theme.urlGeojson.${index}`,
      queryable: true,
      layerTitle: titleFromUrl(geojsonUrl, index),
    },
  });
};

// ---------------------------------------------------------------------------
// Atom — tracks layers created from URL params in the current session
// ---------------------------------------------------------------------------

export const urlGeoJsonLayersAtom = atom<
  VectorLayer<VectorSource<Feature<Geometry>>>[]
>([]);
