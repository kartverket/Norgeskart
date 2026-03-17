import { ProjectionIdentifier } from '../../../projections/types';
import { BackgroundLayerName } from '../../backgroundLayers';

export type LayerProvider = {
  capabilitiesUrl: string;
};

export type BackgroundLayer = {
  layerName: BackgroundLayerName;
  provider: LayerProvider;
  requiredProjection?: ProjectionIdentifier;
  showForProjections?: ProjectionIdentifier[];
};
