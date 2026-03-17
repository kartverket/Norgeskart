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
};

export type BackgroundLayer =
  | WMTSBackgroundLayer
  | VectorTileBackgroundLayer
  | WMSBackgroundLayer;
