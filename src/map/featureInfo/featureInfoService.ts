import { Feature } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { Geometry } from 'ol/geom';
import BaseLayer from 'ol/layer/Base';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import { TileWMS } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import type { FieldConfig } from '../../api/themeLayerConfigApi';
import type {
  FeatureInfoFeature,
  FeatureInfoResult,
  FeatureProperties,
  InfoFormat,
  LayerFeatureInfo,
} from './types';
import { DEFAULT_INFO_FORMAT } from './types';

export const getQueryableWMSLayers = (map: Map): TileLayer[] => {
  return map
    .getLayers()
    .getArray()
    .filter((layer): layer is TileLayer => {
      if (!(layer instanceof TileLayer)) return false;
      const source = layer.getSource();
      if (!(source instanceof TileWMS)) return false;

      const id = layer.get('id');
      const isThemeLayer = typeof id === 'string' && id.startsWith('theme.');
      const isQueryable = layer.get('queryable') === true;
      const isVisible = layer.getVisible();

      return isThemeLayer && isQueryable && isVisible;
    });
};

export const getVisibleVectorLayers = (
  map: Map,
): VectorLayer<VectorSource<Feature<Geometry>>>[] => {
  return map
    .getLayers()
    .getArray()
    .filter((layer): layer is VectorLayer<VectorSource<Feature<Geometry>>> => {
      if (!(layer instanceof VectorLayer)) return false;
      const source = layer.getSource();
      if (!(source instanceof VectorSource)) return false;

      const id = layer.get('id');
      const isThemeLayer = typeof id === 'string' && id.startsWith('theme.');
      const isVisible = layer.getVisible();

      return isThemeLayer && isVisible;
    });
};

export const buildFeatureInfoUrl = (
  layer: TileLayer,
  coordinate: Coordinate,
  map: Map,
  infoFormat: InfoFormat = DEFAULT_INFO_FORMAT,
): string | null => {
  const source = layer.getSource();
  if (!(source instanceof TileWMS)) return null;

  const view = map.getView();
  const resolution = view.getResolution();
  const projection = view.getProjection();

  if (!resolution) return null;

  const url = source.getFeatureInfoUrl(coordinate, resolution, projection, {
    INFO_FORMAT: infoFormat,
    FEATURE_COUNT: 10,
  });

  return url || null;
};

const parseJsonFeatureInfo = (data: unknown): FeatureInfoFeature[] => {
  if (!data || typeof data !== 'object') return [];

  if (
    'features' in data &&
    Array.isArray((data as { features: unknown }).features)
  ) {
    const fc = data as {
      features: Array<{ id?: string; properties?: FeatureProperties }>;
    };
    return fc.features.map((f) => ({
      id: f.id?.toString(),
      properties: f.properties || {},
    }));
  }

  if ('properties' in data) {
    const feature = data as { id?: string; properties?: FeatureProperties };
    return [
      {
        id: feature.id?.toString(),
        properties: feature.properties || {},
      },
    ];
  }

  if (typeof data === 'object' && data !== null) {
    return [{ properties: data as FeatureProperties }];
  }

  return [];
};

const parsePlainTextFeatureInfo = (text: string): FeatureInfoFeature[] => {
  if (!text || text.trim() === '') return [];

  const noFeaturesPatterns = [
    'no features were found',
    'search returned no results',
    'no results',
    'ingen treff',
  ];
  const lowerText = text.toLowerCase();
  if (noFeaturesPatterns.some((p) => lowerText.includes(p))) {
    return [];
  }

  const features: FeatureInfoFeature[] = [];

  const lines = text.split('\n');
  const properties: FeatureProperties = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(/^(.+?)\s*[=:]\s*(.+)$/);
    if (match) {
      const key = match[1].trim();
      const value: string | number = match[2]
        .trim()
        .replace(/^['"]|['"]$/g, '');

      const numValue = parseFloat(value);
      if (!isNaN(numValue) && value === numValue.toString()) {
        properties[key] = numValue;
      } else {
        properties[key] = value;
      }
    }
  }

  if (Object.keys(properties).length > 0) {
    features.push({ properties });
  }

  return features;
};

const parseXmlFeatureInfo = (text: string): FeatureInfoFeature[] => {
  if (!text || text.trim() === '') return [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');

    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      console.warn('XML parse error:', parseError.textContent);
      return [];
    }

    const features: FeatureInfoFeature[] = [];

    const msGMLOutput = doc.querySelector('msGMLOutput');
    if (msGMLOutput) {
      const layerElements = Array.from(msGMLOutput.children).filter((el) =>
        el.localName.endsWith('_layer'),
      );

      for (const layerElement of layerElements) {
        const featureElements = Array.from(layerElement.children).filter((el) =>
          el.localName.endsWith('_feature'),
        );

        for (const featureElement of featureElements) {
          const properties: FeatureProperties = {};

          for (const child of Array.from(featureElement.children)) {
            if (
              child.localName.toLowerCase().includes('geom') ||
              child.localName.toLowerCase() === 'the_geom' ||
              child.localName.toLowerCase() === 'shape' ||
              child.localName.toLowerCase() === 'posisjon' ||
              child.localName === 'boundedBy' ||
              child.namespaceURI === 'http://www.opengis.net/gml'
            ) {
              continue;
            }

            if (child.textContent) {
              const value = child.textContent.trim();
              if (value === '') continue;

              const numValue = parseFloat(value);
              if (!isNaN(numValue) && value === numValue.toString()) {
                properties[child.localName] = numValue;
              } else {
                properties[child.localName] = value;
              }
            }
          }

          if (Object.keys(properties).length > 0) {
            features.push({ properties });
          }
        }
      }

      return features;
    }

    const featureMembers = doc.querySelectorAll(
      'featureMember, gml\\:featureMember, featureMembers > *',
    );

    if (featureMembers.length === 0) {
      const root = doc.documentElement;
      const properties: FeatureProperties = {};

      for (const child of Array.from(root.children)) {
        if (child.children.length === 0 && child.textContent) {
          properties[child.localName] = child.textContent.trim();
        }
      }

      if (Object.keys(properties).length > 0) {
        features.push({ properties });
      }
    } else {
      featureMembers.forEach((member) => {
        const properties: FeatureProperties = {};
        const featureElement = member.children[0] || member;

        for (const child of Array.from(featureElement.children)) {
          if (
            child.localName.toLowerCase().includes('geom') ||
            child.localName.toLowerCase() === 'the_geom' ||
            child.localName.toLowerCase() === 'shape'
          ) {
            continue;
          }

          if (child.textContent) {
            const value = child.textContent.trim();
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && value === numValue.toString()) {
              properties[child.localName] = numValue;
            } else {
              properties[child.localName] = value;
            }
          }
        }

        if (Object.keys(properties).length > 0) {
          const fid =
            featureElement.getAttribute('fid') ||
            featureElement.getAttribute('gml:id');
          features.push({
            id: fid || undefined,
            properties,
          });
        }
      });
    }

    return features;
  } catch (error) {
    console.warn('Failed to parse XML feature info:', error);
    return [];
  }
};

const parseHtmlFeatureInfo = (html: string): FeatureInfoFeature[] => {
  if (!html || html.trim() === '') return [];

  const lowerHtml = html.toLowerCase();
  if (
    lowerHtml.includes('no features') ||
    lowerHtml.includes('ingen treff') ||
    html.trim() === '<html></html>' ||
    html.trim() === ''
  ) {
    return [];
  }

  return [
    {
      properties: {
        _html: html,
      },
    },
  ];
};

export const parseFeatureInfo = (
  data: string | object,
  contentType: string,
): FeatureInfoFeature[] => {
  const lowerContentType = contentType.toLowerCase();

  if (lowerContentType.includes('json')) {
    const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
    return parseJsonFeatureInfo(jsonData);
  }

  if (lowerContentType.includes('html')) {
    return parseHtmlFeatureInfo(data as string);
  }

  if (lowerContentType.includes('xml') || lowerContentType.includes('gml')) {
    return parseXmlFeatureInfo(data as string);
  }

  if (lowerContentType.includes('plain')) {
    return parsePlainTextFeatureInfo(data as string);
  }

  if (typeof data === 'string') {
    try {
      const jsonData = JSON.parse(data);
      return parseJsonFeatureInfo(jsonData);
    } catch {
      return parsePlainTextFeatureInfo(data);
    }
  }

  return parseJsonFeatureInfo(data);
};

export const fetchLayerFeatureInfo = async (
  layer: TileLayer,
  coordinate: Coordinate,
  map: Map,
): Promise<LayerFeatureInfo> => {
  const layerId = layer.get('id') as string;
  const layerTitle =
    (layer.get('layerTitle') as string) || layerId.replace('theme.', '');

  const preferredFormat = layer.get('infoFormat') as InfoFormat | undefined;
  const imageBaseUrl = layer.get('featureInfoImageBaseUrl') as
    | string
    | undefined;
  const fieldConfigs = layer.get('featureInfoFields') as
    | FieldConfig[]
    | undefined;

  const formatsToTry: InfoFormat[] = preferredFormat
    ? [preferredFormat]
    : ['application/json', 'application/vnd.ogc.gml', 'text/xml', 'text/plain'];

  for (const format of formatsToTry) {
    const url = buildFeatureInfoUrl(layer, coordinate, map, format);
    if (!url) {
      return {
        layerId,
        layerTitle,
        features: [],
        error: 'Could not build GetFeatureInfo URL',
        ...(imageBaseUrl ? { imageBaseUrl } : {}),
        ...(fieldConfigs ? { fieldConfigs } : {}),
      };
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        continue;
      }

      const contentType = response.headers.get('content-type') || format;
      const isJson = contentType.includes('json');
      const data = isJson ? await response.json() : await response.text();

      const features = parseFeatureInfo(data, contentType);

      if (features.length > 0) {
        return {
          layerId,
          layerTitle,
          features,
          ...(imageBaseUrl ? { imageBaseUrl } : {}),
          ...(fieldConfigs ? { fieldConfigs } : {}),
        };
      }

      if (isJson) {
        return {
          layerId,
          layerTitle,
          features: [],
          ...(imageBaseUrl ? { imageBaseUrl } : {}),
          ...(fieldConfigs ? { fieldConfigs } : {}),
        };
      }
    } catch (error) {
      console.warn(
        `Failed to fetch feature info with format ${format}:`,
        error,
      );
    }
  }

  return {
    layerId,
    layerTitle,
    features: [],
    ...(imageBaseUrl ? { imageBaseUrl } : {}),
    ...(fieldConfigs ? { fieldConfigs } : {}),
  };
};

export const getVectorFeaturesAtPixel = (
  map: Map,
  pixel: [number, number],
): LayerFeatureInfo[] => {
  const visibleVectorLayers = getVisibleVectorLayers(map);

  if (visibleVectorLayers.length === 0) {
    return [];
  }

  type VectorLayerType = VectorLayer<VectorSource<Feature<Geometry>>>;
  const layerFeaturesRecord: Record<
    string,
    { layer: VectorLayerType; features: FeatureInfoFeature[] }
  > = {};

  visibleVectorLayers.forEach((layer) => {
    const id = (layer.get('id') as string) || String(Math.random());
    layerFeaturesRecord[id] = { layer, features: [] };
  });

  map.forEachFeatureAtPixel(
    pixel,
    (feature, layer) => {
      if (layer instanceof VectorLayer) {
        const layerId = (layer.get('id') as string) || '';
        const record = layerFeaturesRecord[layerId];

        if (record) {
          const properties = feature.getProperties();
          const featureInfo: FeatureInfoFeature = {
            properties: {},
          };

          const featureId = feature.getId();
          if (featureId !== undefined) {
            featureInfo.id = String(featureId);
          }

          for (const [key, value] of Object.entries(properties)) {
            if (
              key === 'geometry' ||
              key.startsWith('_') ||
              value instanceof Geometry
            ) {
              continue;
            }

            if (value === null || value === undefined) {
              continue;
            } else if (typeof value === 'object') {
              featureInfo.properties[key] = JSON.stringify(value);
            } else {
              featureInfo.properties[key] = value;
            }
          }

          if (Object.keys(featureInfo.properties).length > 0) {
            record.features.push(featureInfo);
          }
        }
      }
    },
    {
      hitTolerance: 5, // Allow clicking slightly off the feature, adjust later
    },
  );

  const results: LayerFeatureInfo[] = [];

  for (const record of Object.values(layerFeaturesRecord)) {
    if (record.features.length > 0) {
      const layerId = (record.layer.get('id') as string) || 'unknown';
      const layerTitle =
        (record.layer.get('layerTitle') as string) ||
        (record.layer.get('title') as string) ||
        layerId.replace('theme.', '');

      results.push({
        layerId,
        layerTitle,
        features: record.features,
      });
    }
  }

  return results;
};

export const fetchAllFeatureInfo = async (
  map: Map,
  coordinate: Coordinate,
  pixel: [number, number],
): Promise<FeatureInfoResult> => {
  const queryableWMSLayers = getQueryableWMSLayers(map);

  const vectorLayerResults = getVectorFeaturesAtPixel(map, pixel);

  const wmsLayerResults =
    queryableWMSLayers.length > 0
      ? await Promise.all(
          queryableWMSLayers.map((layer) =>
            fetchLayerFeatureInfo(layer, coordinate, map),
          ),
        )
      : [];

  const wmsLayersWithFeatures = wmsLayerResults.filter(
    (result) => result.features.length > 0 || result.error,
  );

  const allLayers = [...vectorLayerResults, ...wmsLayersWithFeatures];

  return {
    coordinate: coordinate as [number, number],
    layers: allLayers,
    timestamp: Date.now(),
  };
};

export const isQueryableLayer = (layer: BaseLayer): boolean => {
  if (!(layer instanceof TileLayer)) return false;
  const source = layer.getSource();
  if (!(source instanceof TileWMS)) return false;

  const id = layer.get('id');
  const isThemeLayer = typeof id === 'string' && id.startsWith('theme.');
  const isQueryable = layer.get('queryable') === true;

  return isThemeLayer && isQueryable;
};

export const hasVisibleQueryableLayers = (map: Map): boolean => {
  return getQueryableWMSLayers(map).length > 0;
};
