import type { Feature as OlFeature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Circle, type Geometry } from 'ol/geom';
import { fromCircle } from 'ol/geom/Polygon';
import { Text as OlText, Style } from 'ol/style';
import { PointIcon } from '../../draw/drawControls/hooks/drawSettings';
import { Layer } from './printApi';

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
      fillOpacity: number;
      pointRadius: number;
      graphicName: string;
      strokeColor: string;
      strokeWidth: number;
      strokeOpacity: number;
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

const MATERIAL_SYMBOL_CODEPOINTS: Record<string, number> = {
  directions_walk: 0xe536,
  directions_bike: 0xe52f,
  kayaking: 0xe50c,
  sledding: 0xe512,
  phishing: 0xead7,
  camping: 0xf8a2,
  anchor: 0xf1cd,
  home_pin: 0xf14d,
  pin_drop: 0xe55e,
  flag: 0xf0c6,
  local_parking: 0xe54f,
  beenhere: 0xe52d,
  local_see: 0xe557,
  elevation: 0xf6e7,
};

const getMaterialSymbolGraphicName = (iconName: string): string => {
  const codepoint = MATERIAL_SYMBOL_CODEPOINTS[iconName];
  if (codepoint === undefined) return 'circle';
  return `ttf://Material Symbols Outlined#0x${codepoint.toString(16).toUpperCase()}`;
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
  return [
    {
      type: 'polygon',
      fillColor: normalizeHexColor(fillColor),
      fillOpacity: getFillOpacity(fillColor),
      strokeColor: normalizeHexColor(stroke?.getColor() as string),
      strokeWidth: stroke?.getWidth() || 2,
    },
  ];
};

const getLineSymbolizer = (style: Style): PrintSymbolizer[] => {
  const stroke = style.getStroke();
  return [
    {
      type: 'line',
      strokeColor: normalizeHexColor(stroke?.getColor() as string),
      strokeWidth: stroke?.getWidth() || 2,
    },
  ];
};

const getTextSymbolizer = (text: OlText): PrintSymbolizer[] => {
  const labelValue = text.getText?.();
  const label = Array.isArray(labelValue)
    ? labelValue.join('')
    : String(labelValue || '');

  const font = text.getFont() || '';
  const [fontSize, ...fontFamilyParts] = font.split(' ');
  const fontFamily = fontFamilyParts.join(' ');

  const fillColor = normalizeHexColor(text.getFill()?.getColor() as string);
  const strokeColor = text.getStroke()
    ? normalizeHexColor(text.getStroke()?.getColor() as string)
    : '#000000';
  const strokeWidth = text.getStroke()?.getWidth() || 0;
  const fontColor = fillColor;

  const backgroundFill = text.getBackgroundFill();
  const backgroundColor = backgroundFill
    ? (backgroundFill.getColor() as string)
    : undefined;
  const haloColor = normalizeHexColor(backgroundColor || '#ffffff');
  const haloOpacity = getFillOpacity(backgroundColor).toString();
  const haloRadius = '3.0';

  return [
    {
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
    },
  ];
};

const getPointSymbolizer = (
  overlayIcon: PointIcon | null,
): PrintSymbolizer[] => {
  console.log('iconName:', overlayIcon?.icon);
  if (overlayIcon && overlayIcon.icon) {
    const graphicName = getMaterialSymbolGraphicName(overlayIcon.icon);
    return [
      {
        type: 'point',
        fillColor: normalizeHexColor(overlayIcon.color),
        fillOpacity: 1,
        pointRadius: overlayIcon.size * 5,
        graphicName,
        strokeColor: '#FFFFFF',
        strokeWidth: 1,
        strokeOpacity: 1,
      },
    ];
  }
  return [
    {
      type: 'point',
      fillColor: '#000000',
      fillOpacity: 1,
      pointRadius: 10,
      graphicName: 'circle',
      strokeColor: '#FFFFFF',
      strokeWidth: 1,
      strokeOpacity: 1,
    },
  ];
};

export const getSymbolizersFromStyle = (
  style: Style | null,
  geometryType: string,
  overlayIcon?: PointIcon | null,
): PrintSymbolizer[] => {
  if (!style) return [];

  switch (geometryType) {
    case 'Polygon':
      return getPolygonSymbolizer(style);
    case 'LineString':
      return getLineSymbolizer(style);
    case 'Point': {
      const text = style.getText();
      if (text) {
        return getTextSymbolizer(text as OlText);
      }
      return getPointSymbolizer(overlayIcon as PointIcon);
    }
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

    if (!f.properties) f.properties = {};
    if (f.properties) {
      delete f.properties.style;
      for (const key in f.properties) {
        if (f.properties[key] === null) delete f.properties[key];
      }
    }

    let overlayIcon = features[i].get('overlayIcon') as PointIcon | null;
    if (!overlayIcon) {
      const geometry = features[i].getGeometry();
      if (geometry) {
        overlayIcon = geometry.getProperties()[
          'overlayIcon'
        ] as PointIcon | null;
      }
    }
    if (overlayIcon) {
      f.properties.overlayIcon = overlayIcon;
    }

    styleCollection[`[IN('${f.id}')]`] = {
      symbolizers: getSymbolizersFromStyle(
        features[i].getStyle() as Style,
        f.geometry?.type,
        overlayIcon,
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
