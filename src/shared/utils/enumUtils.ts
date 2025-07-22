import { ProjectionIdentifier } from '../../map/atoms';
import { BackgroundLayer } from '../../map/layers';

export const validateProjectionIdString = (
  projectionId: string | null,
): ProjectionIdentifier | null => {
  switch (projectionId) {
    case 'EPSG:25832':
    case 'EPSG:25833':
    case 'EPSG:25835':
    case 'EPSG:3857':
      return projectionId as ProjectionIdentifier;
    default:
      return null;
  }
};

export const validateBackgroundLayerIdString = (
  layerId: string | null,
): BackgroundLayer | null => {
  switch (layerId) {
    case 'topo':
    case 'topo_2025':
    case 'topoGrayscale':
    case 'orthophoto':
      return layerId as BackgroundLayer;
    default:
      return null;
  }
};
