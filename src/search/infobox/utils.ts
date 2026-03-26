import { Feature } from 'ol';
import { Extent } from 'ol/extent';
import { Polygon } from 'ol/geom';

export const getContainingExtent = (features: Feature<Polygon>[]) => {
  return features.reduce((acc: Extent | null, feature) => {
    const geometry = feature.getGeometry();
    if (geometry) {
      const geometryExtent = geometry.getExtent();
      if (acc == null) {
        return geometryExtent;
      }
      return [
        geometryExtent[0] < acc[0] ? geometryExtent[0] : acc[0],
        geometryExtent[1] < acc[1] ? geometryExtent[1] : acc[1],
        geometryExtent[2] > acc[2] ? geometryExtent[2] : acc[2],
        geometryExtent[3] > acc[3] ? geometryExtent[3] : acc[3],
      ];
    }
    return acc;
  }, null);
};
