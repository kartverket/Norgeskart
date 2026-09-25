import { atom } from 'jotai';
import { Feature } from 'ol';
import type { FeatureLike } from 'ol/Feature';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';

const DEFAULT_FILL_COLOR = 'rgba(51, 153, 204, 0.2)';
const DEFAULT_STROKE_COLOR = '#3399cc';
const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_POINT_RADIUS = 6;

const defaultStyle = new Style({
  fill: new Fill({ color: DEFAULT_FILL_COLOR }),
  stroke: new Stroke({
    color: DEFAULT_STROKE_COLOR,
    width: DEFAULT_STROKE_WIDTH,
  }),
  image: new CircleStyle({
    radius: DEFAULT_POINT_RADIUS,
    fill: new Fill({ color: DEFAULT_FILL_COLOR }),
    stroke: new Stroke({
      color: DEFAULT_STROKE_COLOR,
      width: DEFAULT_STROKE_WIDTH,
    }),
  }),
});

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

/** simplestyle-spec v1.1 per feature (marker-symbol unsupported); default style otherwise. */
export const simplestyleToOlStyle = (
  feature: FeatureLike,

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
    typeof props['stroke-opacity'] === 'number' ? props['stroke-opacity'] : 1.0;
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

// dekning_*.geojson files are Geonorge fullstendighetsdekningskart output,
// coloured by their dekningsstatus property.
import { DEKNINGSSTATUS_COLORS } from './dekningsstatusColors';

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

const isDekningUrl = (url: string): boolean => {
  const filename =
    url
      .split('?')[0] // strip query string
      .split('/')
      .pop() ?? '';
  return filename.toLowerCase().startsWith('dekning_');
};

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
    // invalid URL: numbered fallback
  }
  return `GeoJSON ${index + 1}`;
};

/**
 * id `theme.urlGeojson.<n>` makes featureInfoService pick the layer up for click info.
 * Style: dekning_* → dekningsstatus, else simplestyle-spec, else default.
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

  // GeoJSON 1.0 `crs` member: Kartverket files are EPSG:25833, not RFC 7946's 4326.
  const crsName = geojsonData?.crs?.properties?.name;
  let dataProjection = 'EPSG:4326'; // RFC 7946 default
  if (crsName) {
    // "urn:ogc:def:crs:EPSG::25833" | "EPSG:25833" → "EPSG:25833"
    const match = /EPSG[::]+(\d+)/.exec(crsName);
    if (match) dataProjection = `EPSG:${match[1]}`;
  }
  console.log(
    '[urlGeoJson] dataProjection:',
    dataProjection,
    'featureProjection:',
    mapProjection,
  );

  const format = new GeoJSON({
    dataProjection,
    featureProjection: mapProjection,
  });
  const features = format.readFeatures(geojsonData) as Feature<Geometry>[];
  console.log(
    '[urlGeoJson] loaded',
    features.length,
    'features from',
    geojsonUrl,
  );

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
      styleType: isDekningUrl(geojsonUrl) ? 'dekningsstatus' : undefined,
    },
  });
};

// Layers created from URL params this session.
export const urlGeoJsonLayersAtom = atom<
  VectorLayer<VectorSource<Feature<Geometry>>>[]
>([]);
