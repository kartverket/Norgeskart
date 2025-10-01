import { FeatureCollection, GeoJsonProperties } from 'geojson';
import { getDefaultStore, useAtom, useAtomValue } from 'jotai';
import { Feature, Overlay } from 'ol';
import { noModifierKeys, primaryAction } from 'ol/events/condition';
import BaseEvent from 'ol/events/Event';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Circle, Geometry, LineString, Polygon } from 'ol/geom';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify.js';
import Select from 'ol/interaction/Select';
import Translate from 'ol/interaction/Translate';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { getArea, getLength } from 'ol/sphere';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { v4 as uuidv4 } from 'uuid';
import { StyleForStorage } from '../api/nkApiClient';
import { mapAtom, ProjectionIdentifier } from '../map/atoms';
import {
  distanceUnitAtom,
  drawEnabledAtom,
  drawStyleReadAtom,
  drawTypeStateAtom,
  pointStyleAtom,
  showMeasurementsAtom,
} from '../settings/draw/atoms';
import { useDrawActionsState } from '../settings/draw/drawActions/drawActionsHooks';
import { formatArea, formatDistance } from '../shared/utils/stringUtils';
import { getPointStyle } from './pointStyle';

export type DrawType = 'Point' | 'Polygon' | 'LineString' | 'Circle' | 'Move';

const useDrawSettings = () => {
  const map = useAtomValue(mapAtom);
  const [drawType, setDrawTypeState] = useAtom(drawTypeStateAtom);
  const [drawEnabled, setDrawAtomEnabled] = useAtom(drawEnabledAtom);
  const distanceUnit = useAtomValue(distanceUnitAtom);
  const [showMeasurements, setShowMeasurementsAtom] =
    useAtom(showMeasurementsAtom);

  const { addDrawAction, resetActions } = useDrawActionsState();

  const getDrawInteraction = () => {
    return map
      .getInteractions()
      .getArray()
      .filter((interaction) => interaction instanceof Draw)[0] as
      | Draw
      | undefined;
  };

  const getDrawLayer = () => {
    return map
      .getLayers()
      .getArray()
      .filter(
        (layer) => layer.get('id') === 'drawLayer',
      )[0] as unknown as VectorLayer;
  };

  const getSelectInteraction = () => {
    return map
      .getInteractions()
      .getArray()
      .filter((interaction) => interaction instanceof Select)[0] as
      | Select
      | undefined;
  };
  const getTranslateInteraction = () => {
    return map
      .getInteractions()
      .getArray()
      .filter((interaction) => interaction instanceof Translate)[0] as
      | Translate
      | undefined;
  };

  const setDrawEnabled = (enable: boolean) => {
    const drawInteraction = getDrawInteraction();
    const selectInteraction = getSelectInteraction();
    const translateInteraction = getTranslateInteraction();
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
    }
    if (enable) {
      setDrawType('Polygon');
    }
    if (!enable) {
      if (selectInteraction) {
        map.removeInteraction(selectInteraction);
      }
      if (translateInteraction) {
        map.removeInteraction(translateInteraction);
      }
    }
    setDrawAtomEnabled(enable);
  };

  const setDrawType = (type: DrawType) => {
    const draw = getDrawInteraction();
    const select = getSelectInteraction();
    const translate = getTranslateInteraction();
    if (select) {
      map.removeInteraction(select);
    }
    if (translate) {
      map.removeInteraction(translate);
    }
    if (draw) {
      map.removeInteraction(draw);
    }

    if (type === 'Move') {
      const drawLayer = getDrawLayer();
      const selectInteraction = new Select({
        layers: [drawLayer],
      });
      map.addInteraction(selectInteraction);

      const translateInteraction = new Translate({
        features: selectInteraction.getFeatures(),
      });
      const modifyInteraction = new Modify({
        features: selectInteraction.getFeatures(),
      });
      map.addInteraction(translateInteraction);
      map.addInteraction(modifyInteraction);
      setDrawTypeState(type);
      return;
    }

    const drawLayer = getDrawLayer();

    const newDraw = new Draw({
      source: drawLayer.getSource() as VectorSource,
      type: type,
      condition: (e) => noModifierKeys(e) && primaryAction(e),
    });

    const store = getDefaultStore();
    const style = store.get(drawStyleReadAtom);

    newDraw.addEventListener('drawend', (_event: BaseEvent | Event) => {}); //Why this has to be here is beyond me
    newDraw.getOverlay().setStyle(style);
    newDraw.addEventListener('drawend', (event: BaseEvent | Event) => {
      drawEnd(event, style);
    });
    map.addInteraction(newDraw);

    setShowMeasurements(showMeasurements);
    setDrawTypeState(type);
  };

  const getDrawnFeatures = () => {
    return getDrawLayer()?.getSource()?.getFeatures() as
      | Feature<Geometry>[]
      | undefined;
  };

  const drawEnd = (event: BaseEvent | Event, style: Style) => {
    const eventFeature = (event as unknown as DrawEvent).feature;
    const store = getDefaultStore();
    const drawType = store.get(drawTypeStateAtom);

    if (drawType === 'Point') {
      const pointStyle = store.get(pointStyleAtom);
      eventFeature.setStyle(getPointStyle(pointStyle));
    } else {
      eventFeature.setStyle(style);
    }
    const featureId = uuidv4();
    eventFeature.setId(featureId);
    addDrawAction({
      type: 'CREATE',
      featureId: featureId,
      details: { feature: eventFeature },
    });
  };

  const getDrawType = () => {
    const select = getSelectInteraction();
    const draw = getDrawInteraction();
    if (select) {
      return 'Move';
    }
    if (!draw) {
      return null;
    }
    return draw['type_'] as DrawType | null;
  };

  const getStyleFromProperties = (props: GeoJsonProperties) => {
    if (props == null) {
      return null;
    }
    const styleFromProps = props.style as StyleForStorage | undefined;
    if (styleFromProps == null) {
      return null;
    }
    const fill = new Fill({ color: styleFromProps.fill.color });
    const stroke = new Stroke({
      color: styleFromProps.stroke.color,
      width: styleFromProps.stroke.width,
    });

    const icon =
      styleFromProps.icon.radius != null && styleFromProps.icon.color != null
        ? new CircleStyle({
            radius: styleFromProps.icon.radius,
            fill: new Fill({ color: styleFromProps.icon.color }),
          })
        : undefined;

    const style = new Style({
      fill,
      stroke,
      image: icon,
    });

    return style;
  };

  const removeDrawnFeatureById = (featureId: string) => {
    const drawLayer = getDrawLayer();
    const drawSource = drawLayer.getSource() as VectorSource | null;
    if (!drawSource) {
      console.warn('no draw source');
      return;
    }
    const feature = drawSource.getFeatureById(featureId);
    if (feature) {
      drawSource.removeFeature(feature);
    }
  };

  const addFeature = (feature: Feature) => {
    const drawLayer = getDrawLayer();
    const drawSource = drawLayer.getSource() as VectorSource | null;
    if (!drawSource) {
      console.warn('no draw source');
      return;
    }
    drawSource.addFeature(feature);
  };

  const setDrawLayerFeatures = (
    featureCollection: FeatureCollection,
    sourceProjection: ProjectionIdentifier,
    overwrite: boolean = false,
  ) => {
    const drawLayer = getDrawLayer();
    const drawSource = drawLayer.getSource() as VectorSource | null;
    if (!drawSource) {
      console.warn('no draw source');
      return;
    }
    const hasExistingFeatures = drawSource.getFeatures().length > 0;
    if (hasExistingFeatures && !overwrite) {
      console.warn('Draw source already has features');
      return;
    }

    const mapProjection = map.getView().getProjection().getCode();
    const geojsonReader = new GeoJSON();

    const featuresToAddWithStyle: Feature<Geometry>[] = [];

    featureCollection.features.forEach((feature) => {
      const geometryOriginalProjection = geojsonReader.readFeature(
        feature.geometry,
      );
      if (Array.isArray(geometryOriginalProjection)) {
        geometryOriginalProjection.forEach((geom) => {
          const transformedGeometry = geom
            .getGeometry()
            ?.transform(sourceProjection, mapProjection);
          const featureStyle = feature.properties?.style as Style | null;
          if (transformedGeometry) {
            const newFeature = new Feature({
              geometry: transformedGeometry,
              style: featureStyle,
            });
            featuresToAddWithStyle.push(newFeature);
          }
        });
      } else {
        const transformedGeometry = geometryOriginalProjection
          .getGeometry()
          ?.transform(sourceProjection, mapProjection);
        const featureStyle = getStyleFromProperties(feature.properties); //
        if (transformedGeometry) {
          const newFeature = new Feature({
            geometry: transformedGeometry,
          });
          if (featureStyle) {
            newFeature.setStyle(featureStyle);
          }
          featuresToAddWithStyle.push(newFeature);
        }
      }
    });
    drawSource.clear();
    drawSource.addFeatures(featuresToAddWithStyle);
  };

  const setDisplayInteractiveMeasurement = (enable: boolean) => {
    const drawInteraction = getDrawInteraction();
    if (!drawInteraction) {
      return;
    }
    const handleMouseOut = () => {
      document.getElementById('measurement-tooltip')?.classList.add('hidden');
    };
    const handleMouseIn = () => {
      document
        .getElementById('measurement-tooltip')
        ?.classList.remove('hidden');
    };

    if (enable) {
      const elm = document.createElement('div');
      elm.id = 'measurement-tooltip';
      elm.classList.add('hidden');
      elm.classList.add('ol-tooltip');
      elm.classList.add('ol-tooltip-measure');

      const toolTip = new Overlay({
        element: elm,
        offset: [0, -15],
        positioning: 'bottom-center',
        id: 'measurement-tooltip',
      });
      map.addOverlay(toolTip);
      map.getViewport().addEventListener('mouseout', handleMouseOut);
      map.getViewport().addEventListener('mouseover', handleMouseIn);
      drawInteraction.on('drawstart', (event: DrawEvent) => {
        const feature = event.feature;
        feature.getGeometry()?.on('change', (geomEvent) => {
          const geometry = geomEvent.target;
          const geometryPosition = getGeometryPositionForOverlay(geometry);
          const tooltipText = getMeasurementText(geometry);

          if (geometryPosition && tooltipText) {
            toolTip.setPosition(geometryPosition);
            elm.innerHTML = tooltipText;
            elm.classList.remove('hidden');
          }
        });
      });

      drawInteraction.on('drawend', (event: DrawEvent) => {
        const feature = event.feature;
        feature
          .getGeometry()
          ?.getListeners('change')
          ?.forEach((listener) => {
            feature.getGeometry()?.removeEventListener('change', listener);
          });
        toolTip.setPosition(undefined);
        elm.classList.add('hidden');
        addFeatureMeasurementOverlay(
          feature,
          getMeasurementText(feature.getGeometry()!),
        );
      });
    } else {
      map.getViewport().removeEventListener('mouseout', handleMouseOut);
      drawInteraction.getListeners('drawstart')?.forEach((listener) => {
        drawInteraction.removeEventListener('drawstart', listener);
      });
      drawInteraction.getListeners('drawend')?.forEach((listener) => {
        drawInteraction.removeEventListener('drawend', listener);
      });
      const overlay = map.getOverlayById('measurement-tooltip');
      if (overlay) {
        map.removeOverlay(overlay);
      }
    }
  };

  const getMeasurementText = (geometry: Geometry) => {
    let measurementText = '';
    const projectionCode = map.getView().getProjection().getCode();

    if (geometry instanceof Polygon) {
      const area = getArea(geometry, { projection: projectionCode });
      measurementText = formatArea(area, distanceUnit);
    }
    if (geometry instanceof LineString) {
      const length = getLength(geometry, { projection: projectionCode });
      measurementText = formatDistance(length, distanceUnit);
    }
    if (geometry instanceof Circle) {
      const radius = geometry.getRadius();
      measurementText = formatArea(radius * radius * Math.PI, distanceUnit);
    }
    return measurementText;
  };

  const setDisplayStaticMeasurement = (enable: boolean) => {
    if (enable) {
      const drawLayer = getDrawLayer();
      const source = drawLayer?.getSource() as VectorSource | undefined;
      if (!source) {
        return;
      }
      const drawnFeatures = source.getFeatures();
      if (!drawnFeatures) {
        return;
      }
      if (!enable) {
        return;
      }
      drawnFeatures.forEach((feature) => {
        const geometry = feature.getGeometry();
        if (!geometry) {
          return;
        }
        const measurementText = getMeasurementText(geometry);

        addFeatureMeasurementOverlay(feature, measurementText);
      });
    } else {
      removeFeatureMeasurementOverlays();
    }
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

  const addFeatureMeasurementOverlay = (
    feature: Feature<Geometry>,
    text: string,
  ) => {
    const featId = feature.getId();
    const geometry = feature.getGeometry();
    if (!geometry) {
      return;
    }
    const overlayPosition = getGeometryPositionForOverlay(geometry);
    if (!overlayPosition) {
      return;
    }
    const elm = document.createElement('div');
    elm.id = 'measurement-tooltip-' + featId;
    elm.classList.add('ol-tooltip', 'ol-tooltip-measure', 'ol-tooltip-static');
    elm.innerHTML = text;

    const toolTip = new Overlay({
      element: elm,
      offset: [0, -15],
      positioning: 'bottom-center',
      id: 'measurement-tooltip-' + featId,
    });

    toolTip.setPosition(overlayPosition);
    map.addOverlay(toolTip);
  };

  const removeFeatureMeasurementOverlays = () => {
    const overlays = map.getOverlays().getArray();
    overlays.forEach((overlay) => {
      if (!overlay) {
        return;
      }
      const overlayId = overlay.getId()?.toString();
      if (!overlayId) {
        return;
      }

      if (overlayId.startsWith('measurement-tooltip-')) {
        map.removeOverlay(overlay);
      }
    });
    const overlayElements = document.querySelectorAll(
      '[id^="measurement-tooltip-"]',
    );
    overlayElements.forEach((element) => {
      element.remove();
    });
  };

  const setShowMeasurements = (enable: boolean) => {
    setShowMeasurementsAtom(enable);
    setDisplayInteractiveMeasurement(enable);
    setDisplayStaticMeasurement(enable);
  };

  //I hate this
  const refreshMeasurements = () => {
    setShowMeasurements(false);
    setShowMeasurements(true);
  };

  const undoLast = () => {
    const drawInteraction = getDrawInteraction();
    if (!drawInteraction) {
      console.warn('no drawinteraction found');
      return;
    }
    drawInteraction.removeLastPoint();
  };

  const deleteSelected = () => {
    const selectInteraction = getSelectInteraction();
    if (!selectInteraction) {
      return;
    }
    const drawLayerSource = getDrawLayer()?.getSource() as VectorSource | null;
    if (!drawLayerSource) {
      return;
    }

    selectInteraction.getFeatures().forEach((feature) => {
      drawLayerSource.removeFeature(feature);
    });
    addDrawAction({
      type: 'DELETE',
      details: {
        features: selectInteraction
          .getFeatures()
          .getArray()
          .map((f) => {
            const featureToCopy = f.clone();
            featureToCopy.setId(f.getId());
            return featureToCopy;
          }),
      },
    });
  };

  const clearDrawing = () => {
    const drawLayer = getDrawLayer();
    const source = drawLayer.getSource() as VectorSource;
    source.clear();
    setShowMeasurements(false);
    resetActions();
  };

  const abortDrawing = () => {
    const drawInteraction = getDrawInteraction();
    if (drawInteraction) {
      drawInteraction.abortDrawing();
    }
  };

  return {
    drawEnabled,
    drawType,
    showMeasurements,
    removeDrawnFeatureById,
    addFeature,
    setDrawLayerFeatures,
    setDrawEnabled,
    setDrawType,
    setShowMeasurements,
    refreshMeasurements,
    undoLast,
    abortDrawing,
    deleteSelected,
    clearDrawing,
    getDrawLayer,
    getDrawnFeatures,
    getDrawType,
  };
};

export { useDrawSettings };
