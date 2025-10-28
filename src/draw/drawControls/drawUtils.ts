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
  INTERACTIVE_MEASUREMNT_OVERLAY_ID,
  INTERACTIVE_OVERLAY_PREFIX,
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

const addInteractiveMesurementOverlayToFeature = (
  feature: Feature<Geometry>,
) => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const distanceUnit = store.get(distanceUnitAtom);
  const mapProjection = map.getView().getProjection().getCode();
  const featureId = feature.getId();

  const elmementAndOverlayId = featureId
    ? INTERACTIVE_OVERLAY_PREFIX + featureId
    : INTERACTIVE_MEASUREMNT_OVERLAY_ID;
  const elm = document.createElement('div');
  elm.id = elmementAndOverlayId;
  elm.classList.add('ol-tooltip');
  elm.classList.add('ol-tooltip-measure');
  document.body.appendChild(elm);
  const toolTip = new Overlay({
    element: elm,
    offset: [0, -15],
    positioning: 'bottom-center',
    id: elmementAndOverlayId,
  });
  map.addOverlay(toolTip);
  feature.on('change', (geomEvent) => {
    const geometry = geomEvent.target.getGeometry();
    const geometryPosition = getGeometryPositionForOverlay(geometry);
    if (geometryPosition == null) {
      return;
    }
    const tooltipText = getMeasurementText(
      geometry,
      mapProjection,
      distanceUnit,
    );

    elm.classList.remove('hidden');
    toolTip.setPosition(geometryPosition);
    elm.innerHTML = tooltipText;
  });
};

const removeInteractiveMesurementOverlayFromFeature = (
  feature: Feature<Geometry>,
) => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const featureId = feature.getId();
  if (featureId == null) {
    console.warn('feature has no id');
    return;
  }
  const elmementAndOverlayId = INTERACTIVE_OVERLAY_PREFIX + featureId;
  const overlay = map.getOverlayById(elmementAndOverlayId);
  if (overlay) {
    map.removeOverlay(overlay);
  }
  const elm = document.getElementById(elmementAndOverlayId);
  if (elm) {
    elm.remove();
  }
};
const removeFeaturelessInteractiveMeasurementOverlay = () => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const overlay = map.getOverlayById(INTERACTIVE_MEASUREMNT_OVERLAY_ID);
  if (overlay) {
    map.removeOverlay(overlay);
  }
  const elm = document.getElementById(INTERACTIVE_MEASUREMNT_OVERLAY_ID);
  if (elm) {
    elm.remove();
  }
};

export {
  addInteractiveMesurementOverlayToFeature,
  enableFeatureMeasurmentOverlay,
  getGeometryPositionForOverlay,
  getMeasurementText,
  removeFeaturelessInteractiveMeasurementOverlay,
  removeInteractiveMesurementOverlayFromFeature,
};
