import { getDefaultStore } from 'jotai';
import { Feature, Overlay } from 'ol';
import { Circle, Geometry, LineString, Polygon } from 'ol/geom';
import { getArea, getLength } from 'ol/sphere';
import { mapAtom } from '../../map/atoms';
import {
  DistanceUnit,
  distanceUnitAtom,
  showMeasurementsAtom,
} from '../../settings/draw/atoms';
import { formatArea, formatDistance } from '../../shared/utils/stringUtils';
import {
  MEASUREMNT_ELEMENT_PREFIX,
  MEASUREMNT_OVERLAY_PREFIX,
} from './hooks/drawSettings';

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

const enableFeatureMeasurmentOverlay = (feature: Feature<Geometry>) => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const unit = store.get(distanceUnitAtom);
  const shouldShow = store.get(showMeasurementsAtom);
  if (!shouldShow) {
    return;
  }

  const featId = feature.getId();
  if (!featId) {
    return;
  }

  const existingOverlay = map.getOverlayById(
    MEASUREMNT_OVERLAY_PREFIX + featId,
  );
  if (existingOverlay) {
    map.removeOverlay(existingOverlay);
  }

  const geometry = feature.getGeometry();
  if (!geometry) {
    return;
  }

  const projection = map.getView().getProjection().getCode();
  const measurementText = getMeasurementText(geometry, projection, unit);

  const overlayPosition = getGeometryPositionForOverlay(geometry);
  if (!overlayPosition) {
    return;
  }
  const elm = document.createElement('div');
  elm.id = MEASUREMNT_ELEMENT_PREFIX + featId;
  elm.classList.add('ol-tooltip', 'ol-tooltip-measure', 'ol-tooltip-static');
  elm.innerHTML = measurementText;

  const toolTip = new Overlay({
    element: elm,
    offset: [0, -15],
    positioning: 'bottom-center',
    id: MEASUREMNT_OVERLAY_PREFIX + featId,
  });

  toolTip.setPosition(overlayPosition);
  map.addOverlay(toolTip);
};

export {
  enableFeatureMeasurmentOverlay,
  getGeometryPositionForOverlay,
  getMeasurementText,
};
