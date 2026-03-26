import { ProjectionIdentifier } from '../../../projections/types';
import {
  BackgroundLayerName,
  VectorTileLayerName,
  WMSLayerName,
  WMTSLayerName,
} from '../../backgroundLayers';

export type LayerType = 'WMTS' | 'WMS' | 'VectorTile';

export type LayerProvider = {
  capabilitiesUrl: string;
};

type BackgroundLayerBase = {
  layerName: BackgroundLayerName;
  requiredProjection?: ProjectionIdentifier;
  showForProjections?: ProjectionIdentifier[];
  moveToExtent?: [number, number, number, number];
};

export type WMTSBackgroundLayer = BackgroundLayerBase & {
  type: 'WMTS';
  layerName: WMTSLayerName;
  provider: LayerProvider;
};

export type VectorTileBackgroundLayer = BackgroundLayerBase & {
  type: 'VectorTile';
  layerName: VectorTileLayerName;
  styleUrl: string;
};

export type WMSBackgroundLayer = BackgroundLayerBase & {
  type: 'WMS';
  layerName: WMSLayerName;
  url: string;
  props?: Record<string, string | number | boolean>;
};

export type BackgroundLayer =
  | WMTSBackgroundLayer
  | VectorTileBackgroundLayer
  | WMSBackgroundLayer;
