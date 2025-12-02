import type { FieldConfig } from '../../api/themeLayerConfigApi';

export interface FeatureProperties {
  [key: string]: string | number | boolean | null;
}

export interface FeatureInfoFeature {
  id?: string;
  properties: FeatureProperties;
}

export interface LayerFeatureInfo {
  layerId: string;
  layerTitle: string;
  features: FeatureInfoFeature[];
  error?: string;
  imageBaseUrl?: string;
  fieldConfigs?: FieldConfig[];
}

export interface FeatureInfoResult {
  coordinate: [number, number];
  layers: LayerFeatureInfo[];
  timestamp: number;
}

export type InfoFormat =
  | 'application/json'
  | 'application/vnd.ogc.gml'
  | 'application/vnd.ogc.gml/3.1.1'
  | 'text/xml'
  | 'text/xml; subtype=gml/3.1.1'
  | 'text/plain'
  | 'text/html';

export const DEFAULT_INFO_FORMAT: InfoFormat = 'application/json';
