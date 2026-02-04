import type { Feature as OlFeature } from 'ol';
import { GeoJSON } from 'ol/format';
import type { Geometry } from 'ol/geom';
import { StyleForStorage } from '../../api/nkApiClient';
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
    pointRadius: number;
    graphicName: string;
  }
  |
  {
    type: 'text';
    text: string;
    font: string;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
  }


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

export const getSymbolizersFromStyle = (
  style: StyleForStorage | null,
  geometryType: string,
  feature?: OlFeature<Geometry>,
): PrintSymbolizer[] => {
  if (!style) return [];

  switch (geometryType) {
    case 'Polygon':
      return [
        {
          type: 'polygon',
          fillColor: normalizeHexColor(
            style.fill?.color?.toString() ?? 'rgba(255,255,255,0.5)',
          ),
          fillOpacity: 0.5,
          strokeColor: normalizeHexColor(
            style.stroke?.color?.toString() ?? '#000',
          ),
          strokeWidth: style.stroke?.width ?? 2,
        },
      ];
    case 'LineString':
      return [
        {
          type: 'line',
          strokeColor: normalizeHexColor(
            style.stroke?.color?.toString() ?? '#000',
          ),
          strokeWidth: style.stroke?.width ?? 2,
        },
      ];
    case 'Point': {
      // Sjekk om feature har overlayIcon property
      const overlayIcon = feature?.get('overlayIcon') as { icon: string; color: string; size: number } | undefined;
      if (overlayIcon) {
        return [
          {
            type: 'point',
            fillColor: normalizeHexColor(overlayIcon.color ?? '#000'),
            pointRadius: overlayIcon.size ?? 8,
            graphicName: overlayIcon.icon, // MaterialSymbol-navn
          },
        ];
      }
      // Sjekk om det finnes tekst i style
      if (style?.text?.text) {
        return [
          {
            type: 'text',
            text: style.text.text,
            font: style.text.font ?? '16px sans-serif',
            fillColor: normalizeHexColor(style.text.fillColor?.toString() ?? '#000'),
            strokeColor: normalizeHexColor(style.text.stroke?.color?.toString() ?? '#000'),
            strokeWidth: style.text.stroke?.width ?? 1,
          },
        ];
      }
    }
      return [
        {
          type: 'point',
          fillColor: normalizeHexColor(style?.icon?.color?.toString() ?? '#000'),
          pointRadius: style?.icon?.radius ?? 6,
          graphicName: 'circle',
        },
      ];
    default:
      return [];
  }
};
export const createGeoJsonLayerWithStyles = (
  features: OlFeature<Geometry>[],
  sourceProjection: string,
  targetProjection: string,
  styleForStorage: StyleForStorage,
): Layer => {
  const geoJson = new GeoJSON().writeFeaturesObject(features, {
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
      symbolizers: getSymbolizersFromStyle(styleForStorage, f.geometry?.type, features[i]),
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
