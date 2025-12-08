import { getDefaultStore } from 'jotai';
import { Feature, Overlay } from 'ol';
import { Circle, Geometry, LineString, Polygon } from 'ol/geom';
import { getArea, getLength } from 'ol/sphere';
import { Stroke, Style } from 'ol/style';
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
import { getDrawOverlayLayer } from './hooks/mapLayers';

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

const getCircleRadiusMeasurementText = (circle: Circle, unit: DistanceUnit) => {
  const radius = circle.getRadius();
  return 'r: ' + formatDistance(radius, unit);
};

const getCircleAreaMeasurementText = (circle: Circle, unit: DistanceUnit) => {
  const area = circle.getRadius() * circle.getRadius() * Math.PI;
  return 'A: ' + formatArea(area, unit);
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

const clearStaticOverlaysForFeature = (feature: Feature<Geometry>) => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const featId = feature.getId();
  if (!featId) {
    return;
  }
  map
    .getOverlays()
    .getArray()
    .filter((f) => {
      const fid = f.getId();
      return (
        fid != null &&
        fid.toString().startsWith(MEASUREMNT_OVERLAY_PREFIX + featId)
      );
    })
    .forEach((f) => {
      const elm = f.getElement();
      if (elm) {
        elm.remove();
      }
      map.removeOverlay(f);
    });

  const drawOverlayLayerSource = getDrawOverlayLayer().getSource();
  console.log(drawOverlayLayerSource?.getFeatures());
  if (drawOverlayLayerSource) {
    const existingLine = drawOverlayLayerSource.getFeatureById(
      MEASUREMNT_ELEMENT_PREFIX + featId + 'radiusline',
    );
    console.log(existingLine);
    if (existingLine) {
      drawOverlayLayerSource.removeFeature(existingLine);
    }
  }
};

const enableFeatureMeasurmentOverlay = (feature: Feature<Geometry>) => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const unit = store.get(distanceUnitAtom);
  const shouldShow = store.get(showMeasurementsAtom);
  if (!shouldShow) {
    return;
  }
  clearStaticOverlaysForFeature(feature);

  const geometry = feature.getGeometry();

  if (!geometry) {
    return;
  }
  const featId = feature.getId();

  const projection = map.getView().getProjection().getCode();

  if (geometry instanceof Circle) {
    const radiusText = getCircleRadiusMeasurementText(geometry, unit);
    const areaText = getCircleAreaMeasurementText(geometry, unit);

    const elmArea = document.createElement('div');
    elmArea.id = MEASUREMNT_ELEMENT_PREFIX + featId + 'area';
    elmArea.classList.add(
      'ol-tooltip',
      'ol-tooltip-static',
      'ol-tooltip-measure-arrow-down',
      'ol-tooltip-static-arrow-down',
    );
    elmArea.style.userSelect = 'text';
    elmArea.innerHTML = areaText;

    const areaOverlay = new Overlay({
      element: elmArea,
      offset: [0, -9],
      positioning: 'bottom-center',
      id: MEASUREMNT_OVERLAY_PREFIX + featId + 'area',
      position: geometry.getCenter(),
    });
    map.addOverlay(areaOverlay);

    const center = geometry.getCenter();
    const radius = geometry.getRadius();
    const angle = 0; // 0 radians = east/right
    const edge = [
      center[0] + radius * Math.cos(angle),
      center[1] + radius * Math.sin(angle),
    ];

    const midPoint = [
      center[0] + (radius / 2) * Math.cos(angle),
      center[1] + (radius / 2) * Math.sin(angle),
    ];

    // Create a LineString from center to edge
    const radiusLine = new Feature({
      geometry: new LineString([center, edge]),
      id: MEASUREMNT_ELEMENT_PREFIX + featId + 'radiusline',
    });
    radiusLine.setId(MEASUREMNT_ELEMENT_PREFIX + featId + 'radiusline');
    radiusLine.setStyle(
      new Style({
        stroke: new Stroke({
          color: 'red',
          width: 2,
          lineDash: [10, 10],
        }),
      }),
    );
    getDrawOverlayLayer().getSource()?.addFeature(radiusLine);

    const elmRadius = document.createElement('div');
    elmRadius.id = MEASUREMNT_ELEMENT_PREFIX + featId + 'radius';
    elmRadius.classList.add(
      'ol-tooltip',
      'ol-tooltip-static',
      'ol-tooltip-measure-arrow-up',
      'ol-tooltip-static-arrow-up',
    );
    elmRadius.innerHTML = radiusText;
    const radiusOverlay = new Overlay({
      element: elmRadius,
      offset: [0, 6],
      positioning: 'top-center',
      id: MEASUREMNT_OVERLAY_PREFIX + featId + 'radius',
      position: midPoint,
    });

    map.addOverlay(radiusOverlay);
  } else {
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
      element: undefined,
      offset: [0, -15],
      positioning: 'bottom-center',
      id: MEASUREMNT_OVERLAY_PREFIX + featId,
    });
    toolTip.setElement(elm);
    toolTip.setPosition(overlayPosition);
    map.addOverlay(toolTip);
  }
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
  clearStaticOverlaysForFeature,
  enableFeatureMeasurmentOverlay,
  getGeometryPositionForOverlay,
  getMeasurementText,
  removeFeaturelessInteractiveMeasurementOverlay,
  removeInteractiveMesurementOverlayFromFeature,
};
