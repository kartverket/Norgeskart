import { Circle, Geometry, LineString, Polygon } from 'ol/geom';
import { getArea, getLength } from 'ol/sphere';
import { DistanceUnit } from '../../settings/draw/atoms';
import { formatArea, formatDistance } from '../../shared/utils/stringUtils';

const getMeasurementText = (
  geometry: Geometry,
  projection: string,
  unit: DistanceUnit,
) => {
  let measurementText = '';

  if (geometry instanceof Polygon) {
    const area = getArea(geometry, { projection: projection });
    measurementText = formatArea(area, unit);
  }
  if (geometry instanceof LineString) {
    const length = getLength(geometry, { projection: projection });
    measurementText = formatDistance(length, unit);
  }
  if (geometry instanceof Circle) {
    const radius = geometry.getRadius();
    measurementText = formatDistance(radius, unit);
  }
  return measurementText;
};

const getGeometryPositionForOverlay = (geometry: Geometry) => {
  if (geometry instanceof Polygon) {
    return geometry.getInteriorPoint().getCoordinates();
  }
  if (geometry instanceof LineString) {
    return geometry.getLastCoordinate();
  }
  if (geometry instanceof Circle) {
    return geometry.getCenter();
  }
  return null;
};

export { getGeometryPositionForOverlay, getMeasurementText };
