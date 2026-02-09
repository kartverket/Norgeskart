import { ProjectionIdentifier } from '../../map/projections/types';

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
