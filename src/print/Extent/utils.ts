import type { Feature as OlFeature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Circle, type Geometry } from 'ol/geom';
import { fromCircle } from 'ol/geom/Polygon';
import { Layer } from './printApi';
import { Style } from 'ol/style';
import { Text as OlText } from 'ol/style';


type PrintSymbolizer =
  | {
    type: 'polygon';
    fillColor: string;
    fillOpacity: number;
    strokeColor: string;
    strokeWidth: number;
  }
  | {
    type: 'line';
    strokeColor: string;
    strokeWidth: number;
  }
  | {
    type: 'point';
    fillColor: string;
    pointRadius: number;
    graphicName: string;
  }
  | {
    type: 'text';
    label: string;
    fontFamily: string;
    fontSize: string;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    fontColor: string;
    haloColor: string;
    haloOpacity: string;
    haloRadius: string;
  };

type StyleCollection = {
  version: string;
  [featureId: string]: { symbolizers: PrintSymbolizer[] } | string;
};

// Backend only accepts 6-digit hex colors, convert rgba and 8-digit hex
const normalizeHexColor = (color: string): string => {
  if (color.startsWith('#') && color.length === 9) {
    return color.slice(0, 7);
  }

  const rgbaMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  return color;
};

const getFillOpacity = (color: string | undefined): number => {
  if (!color) return 1;
  const match = color.match(/^rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
  if (match) return parseFloat(match[1]);
  return 1;
};

const getPolygonSymbolizer = (style: Style): PrintSymbolizer[] => {
  const fill = style.getFill();
  const stroke = style.getStroke();
  const fillColor = fill?.getColor() as string;
  return [{
    type: 'polygon',
    fillColor: normalizeHexColor(fillColor),
    fillOpacity: getFillOpacity(fillColor),
    strokeColor: normalizeHexColor(stroke?.getColor() as string),
    strokeWidth: stroke?.getWidth() || 2,
  }];
};

const getLineSymbolizer = (style: Style): PrintSymbolizer[] => {
  const stroke = style.getStroke();
  return [{
    type: 'line',
    strokeColor: normalizeHexColor(stroke?.getColor() as string),
    strokeWidth: stroke?.getWidth() || 2,
  }]
}

const getTextSymbolizer = (text: OlText): PrintSymbolizer[] => {
  const labelValue = text.getText?.();
  const label = Array.isArray(labelValue) ? labelValue.join('') : String(labelValue || '');

  const font = text.getFont() || '';
  const [fontSize, ...fontFamilyParts] = font.split(' ');
  const fontFamily = fontFamilyParts.join(' ');

  const fillColor = normalizeHexColor(text.getFill()?.getColor() as string);
  const strokeColor = text.getStroke() ? normalizeHexColor(text.getStroke()?.getColor() as string) : '#000000';
  const strokeWidth = text.getStroke()?.getWidth() || 0;
  const fontColor = fillColor;

  // Hent ut backgroundFill og farge
  const backgroundFill = text.getBackgroundFill();
  const backgroundColor = backgroundFill ? backgroundFill.getColor() as string : undefined;
  const haloColor = normalizeHexColor(backgroundColor || '#ffffff');
  const haloOpacity = getFillOpacity(backgroundColor).toString();
  const haloRadius = "5";

  return [{
    type: 'text',
    label,
    fontFamily,
    fontSize,
    fillColor,
    strokeColor,
    strokeWidth,
    fontColor,
    haloColor,
    haloOpacity,
    haloRadius,
  }];
}


export const getSymbolizersFromStyle = (
  style: Style | null,
  geometryType: string
): PrintSymbolizer[] => {
  if (!style) return [];

  switch (geometryType) {
    case 'Polygon':
      return getPolygonSymbolizer(style);
    case 'LineString':
      return getLineSymbolizer(style);
    case 'Point':
      const text = style.getText();

      console.log('text background', text?.getBackgroundFill());
      return getTextSymbolizer(style.getText() as OlText);
      // TODO: Implement point symbolizer extraction from style
      return [];
    default:
      return [];
  }
};
export const createGeoJsonLayerWithStyles = (
  features: OlFeature<Geometry>[],
  sourceProjection: string,
  targetProjection: string,
): Layer => {

  // Convert circles to polygons
  const featuresForGeoJson = features.map((feature) => {
    const geom = feature.getGeometry();
    if (geom instanceof Circle) {
      const polygon = fromCircle(geom, 64);
      const newFeature = feature.clone();
      newFeature.setGeometry(polygon);
      return newFeature;
    }
    return feature;
  });
  const geoJson = new GeoJSON().writeFeaturesObject(featuresForGeoJson, {
    featureProjection: sourceProjection,
    dataProjection: targetProjection,
  });

  const styleCollection: StyleCollection = { version: '2' };
  for (let i = 0; i < geoJson.features.length; i++) {
    const f = geoJson.features[i];
    if (!f.id) f.id = features[i].getId();
    if (f.properties) {
      delete f.properties.style;
      for (const key in f.properties) {
        if (f.properties[key] === null) delete f.properties[key];
      }
    }

    styleCollection[`[IN('${f.id}')]`] = {
      symbolizers: getSymbolizersFromStyle(
        features[i].getStyle() as Style,
        f.geometry?.type,
      ),
    };
  }

  return {
    type: 'geojson',
    name: 'drawings',
    geoJson: {
      type: 'FeatureCollection',
      features: geoJson.features.map((f) => ({
        type: 'Feature',
        geometry: f.geometry,
        properties: f.properties || {},
        id: f.id,
      })),
    },
    style: {
      ...styleCollection,
    },
    opacity: 1,
  };
};
