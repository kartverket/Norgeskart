import { ProjectionIdentifier } from '../../../projections/types';
import { BackgroundLayerName } from '../../backgroundLayers';

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
  provider: LayerProvider;
};

export type VectorTileBackgroundLayer = BackgroundLayerBase & {
  type: 'VectorTile';
  styleUrl: string;
};

export type WMSBackgroundLayer = BackgroundLayerBase & {
  type: 'WMS';
  url: string;
  props?: Record<string, string | number | boolean>;
};

export type BackgroundLayer =
  | WMTSBackgroundLayer
  | VectorTileBackgroundLayer
  | WMSBackgroundLayer;
