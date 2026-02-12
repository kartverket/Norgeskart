import type { Feature as OlFeature } from 'ol';
import { GeoJSON } from 'ol/format';
import type { Geometry } from 'ol/geom';
import { StyleForStorage } from '../../api/nkApiClient';
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

export const getSymbolizersFromStyle = (
  style: StyleForStorage | null,
  geometryType: string,
  overlayIcon?: PointIcon | null,
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
      if (overlayIcon) {
        const graphicName = getMaterialSymbolGraphicName(overlayIcon.icon);
        if (graphicName !== 'circle') {
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
      }
      return [
        {
          type: 'point',
          fillColor: normalizeHexColor(style.icon?.color?.toString() ?? '#000'),
          fillOpacity: 1,
          pointRadius: style.icon?.radius ?? 6,
          graphicName: 'circle',
          strokeColor: normalizeHexColor(
            style.icon?.color?.toString() ?? '#000',
          ),
          strokeWidth: 0,
          strokeOpacity: 0,
        },
      ];
    }
    //ToDo: tekst og circle
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
    
    if (!f.properties) {
      f.properties = {};
    }
    
    delete f.properties.style;
    for (const key in f.properties) {
      if (f.properties[key] === null) delete f.properties[key];
    }
    
    let overlayIcon = features[i].getProperties()['overlayIcon'] as
      | PointIcon
      | undefined;
    
    if (!overlayIcon) {
      const geometry = features[i].getGeometry();
      if (geometry) {
        overlayIcon = geometry.getProperties()['overlayIcon'] as
          | PointIcon
          | undefined;
      }
    }
    
    if (overlayIcon) {
      f.properties.overlayIcon = overlayIcon;
    }
    
    styleCollection[`[IN('${f.id}')]`] = {
      symbolizers: getSymbolizersFromStyle(
        styleForStorage,
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
