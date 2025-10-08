import { FeatureCollection, GeoJsonProperties } from 'geojson';
import { getDefaultStore, useAtom, useAtomValue } from 'jotai';
import { Feature, Overlay } from 'ol';
import { noModifierKeys, primaryAction } from 'ol/events/condition';
import BaseEvent from 'ol/events/Event';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Geometry } from 'ol/geom';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify.js';
import Select, { SelectEvent } from 'ol/interaction/Select';
import Translate, { TranslateEvent } from 'ol/interaction/Translate';
import VectorSource from 'ol/source/Vector';
import { Fill, RegularShape, Stroke, Style, Text } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { v4 as uuidv4 } from 'uuid';
import { StyleForStorage } from '../../../api/nkApiClient';
import { mapAtom, ProjectionIdentifier } from '../../../map/atoms';
import {
  DistanceUnit,
  distanceUnitAtom,
  drawEnabledAtom,
  drawStyleReadAtom,
  drawTypeStateAtom,
  pointStyleReadAtom,
  showMeasurementsAtom,
  textInputAtom,
  textStyleReadAtom,
} from '../../../settings/draw/atoms';
import { useDrawActionsState } from '../../../settings/draw/drawActions/drawActionsHooks';
import {
  getGeometryPositionForOverlay,
  getMeasurementText,
} from '../drawUtils';
import { useMapInteractions } from './mapInterations';
import { useMapLayers } from './mapLayers';
import { useVerticalMove } from './verticalMove';

const INTERACTIVE_MEASUREMNT_OVERLAY_ID = 'interactive-measurement-tooltip';
const MEASUREMNT_OVERLAY_PREFIX = 'measurement-overlay-';
const MEASUREMNT_ELEMENT_PREFIX = 'measurement-tooltip-';

export type FeatureMoveDetail = {
  featureId: string;
  geometryBeforeMove: Geometry;
  geometryAfterMove: Geometry;
};

export type DrawType =
  | 'Point'
  | 'Polygon'
  | 'LineString'
  | 'Circle'
  | 'Move'
  | 'Text';

const selectCompletedListener = (e: BaseEvent | Event) => {
  if (e instanceof SelectEvent) {
    e.deselected.forEach(handleFeatureSetZIndex);
  }
};

const handleFeatureSetZIndex = (feature: Feature<Geometry>) => {
  const style = feature.getStyle();
  const zIndex = feature.get('zIndex') | 0;
  if (style && style instanceof Style) {
    style.setZIndex(zIndex);
    feature.setStyle(style);
  }
};
const handleTranslateStart = (e: BaseEvent | Event) => {
  if (e instanceof TranslateEvent) {
    e.features.getArray().forEach((f) => {
      const preGeo = f.getGeometry()?.clone();
      if (preGeo == null) {
        return;
      }
      f.set('geometryPreMove', preGeo);
    });
  }
};

const handleTranslateEnd = (e: BaseEvent | Event) => {
  if (e instanceof TranslateEvent) {
    const moveDetails = e.features.getArray().map((f) => {
      const geometryBeforeMove = f.get('geometryPreMove');
      const geometryAfterMove = f.getGeometry()?.clone();
      f.set('extentBeforeMove', undefined);
      return {
        featureId: f.getId(),
        geometryBeforeMove: geometryBeforeMove as Geometry | undefined,
        geometryAfterMove: geometryAfterMove as Geometry | undefined,
      } as FeatureMoveDetail;
    });
    const event = new CustomEvent('featureMoved', { detail: moveDetails });
    document.dispatchEvent(event);
  }
};

const useDrawSettings = () => {
  const map = useAtomValue(mapAtom);
  const [drawType, setDrawTypeState] = useAtom(drawTypeStateAtom);
  const [drawEnabled, setDrawAtomEnabled] = useAtom(drawEnabledAtom);
  const [distanceUnit, setDistanceUnitAtomValue] = useAtom(distanceUnitAtom);
  const [showMeasurements, setShowMeasurementsAtom] =
    useAtom(showMeasurementsAtom);
  const { getHighestZIndex } = useVerticalMove();

  const { getSelectInteraction, getTranslateInteraction, getDrawInteraction } =
    useMapInteractions();
  const { getDrawLayer } = useMapLayers();

  const { addDrawAction, resetActions } = useDrawActionsState();
  const mapProjection = map.getView().getProjection().getCode();

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
        const features = selectInteraction.getFeatures();
        map.removeInteraction(selectInteraction);
        features.forEach(handleFeatureSetZIndex);
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
      const features = select.getFeatures();
      map.removeInteraction(select);
      features.forEach(handleFeatureSetZIndex);
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
      selectInteraction.addEventListener('select', selectCompletedListener);
      map.addInteraction(selectInteraction);

      const translateInteraction = new Translate({
        features: selectInteraction.getFeatures(),
      });

      translateInteraction.addEventListener(
        'translatestart',
        handleTranslateStart,
      );
      translateInteraction.addEventListener('translateend', handleTranslateEnd);

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
      type: type === 'Text' ? 'Point' : type,
      condition: (e) => noModifierKeys(e) && primaryAction(e),
    });

    const store = getDefaultStore();
    const style = store.get(drawStyleReadAtom);

    newDraw.addEventListener('drawend', (_event: BaseEvent | Event) => {}); //Why this has to be here is beyond me
    newDraw.getOverlay().setStyle(style);
    newDraw.addEventListener('drawend', (event: BaseEvent | Event) => {
      drawEnd(event);
    });
    map.addInteraction(newDraw);

    setShowMeasurements(showMeasurements);
    setDrawTypeState(type);
  };

  const setDistanceUnit = (unit: DistanceUnit) => {
    if (showMeasurements) {
      setDisplayInteractiveMeasurement(true, unit);
      setDisplayStaticMeasurement(true, unit);
    }
    setDistanceUnitAtomValue(unit);
  };

  const getDrawnFeatures = () => {
    return getDrawLayer()?.getSource()?.getFeatures() as
      | Feature<Geometry>[]
      | undefined;
  };

  const drawEnd = (event: BaseEvent | Event) => {
    const eventFeature = (event as unknown as DrawEvent).feature;
    const store = getDefaultStore();
    const drawType = store.get(drawTypeStateAtom);
    const zIndex = getHighestZIndex() + 1;

    if (drawType === 'Point') {
      const style = store.get(pointStyleReadAtom);
      style.setZIndex(zIndex);
      eventFeature.setStyle(style);
    } else {
      const style = store.get(drawStyleReadAtom);
      style.setZIndex(zIndex);
      eventFeature.setStyle(style);
    }

    if (drawType === 'Text') {
      const text = store.get(textInputAtom);
      const style = store.get(textStyleReadAtom).clone();
      const textStyle = style.getText();
      if (textStyle) {
        textStyle.setText(text);
      }
      eventFeature.set('text', text);
      eventFeature.setStyle(style);
    }

    const featureId = uuidv4();
    eventFeature.setId(featureId);
    eventFeature.set('zIndex', zIndex);
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
      styleFromProps.icon.points != null
        ? new RegularShape({
            points: styleFromProps.icon.points,
            radius: styleFromProps.icon.radius ?? 10,
            radius2: styleFromProps.icon.radius2,
            angle: styleFromProps.icon.angle,
            scale: styleFromProps.icon.scale,
            fill: new Fill({ color: styleFromProps.icon.color }),
          })
        : styleFromProps.icon.radius != null &&
            styleFromProps.icon.color != null
          ? new CircleStyle({
              radius: styleFromProps.icon.radius,
              fill: new Fill({ color: styleFromProps.icon.color }),
            })
          : undefined;

    const text = styleFromProps.text
      ? new Text({
          text: styleFromProps.text?.value,
          font: styleFromProps.text?.font,
          fill: styleFromProps.text?.fillColor
            ? new Fill({ color: styleFromProps.text?.fillColor })
            : undefined,
          backgroundFill: styleFromProps.text?.backgroundFillColor
            ? new Fill({ color: styleFromProps.text?.backgroundFillColor })
            : undefined,
        })
      : undefined;

    const style = new Style({
      fill,
      stroke,
      image: icon,
      text,
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

  const setDisplayInteractiveMeasurement = (
    enable: boolean,
    distanceUnit: DistanceUnit,
  ) => {
    const drawInteraction = getDrawInteraction();
    if (!drawInteraction) {
      return;
    }
    const handleMouseOut = () => {
      document
        .getElementById(INTERACTIVE_MEASUREMNT_OVERLAY_ID)
        ?.classList.add('hidden');
    };
    const handleMouseIn = () => {
      document
        .getElementById(INTERACTIVE_MEASUREMNT_OVERLAY_ID)
        ?.classList.remove('hidden');
    };

    if (enable) {
      const elm = document.createElement('div');
      elm.id = INTERACTIVE_MEASUREMNT_OVERLAY_ID;
      elm.classList.add('hidden');
      elm.classList.add('ol-tooltip');
      elm.classList.add('ol-tooltip-measure');

      const toolTip = new Overlay({
        element: elm,
        offset: [0, -15],
        positioning: 'bottom-center',
        id: INTERACTIVE_MEASUREMNT_OVERLAY_ID,
      });
      map.addOverlay(toolTip);
      map.getViewport().addEventListener('mouseout', handleMouseOut);
      map.getViewport().addEventListener('mouseover', handleMouseIn);
      drawInteraction.on('drawstart', (event: DrawEvent) => {
        const feature = event.feature;
        feature.getGeometry()?.on('change', (geomEvent) => {
          const geometry = geomEvent.target;
          const geometryPosition = getGeometryPositionForOverlay(geometry);
          const tooltipText = getMeasurementText(
            geometry,
            mapProjection,
            distanceUnit,
          );

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
          getMeasurementText(
            feature.getGeometry()!,
            mapProjection,
            distanceUnit,
          ),
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
      const overlay = map.getOverlayById(INTERACTIVE_MEASUREMNT_OVERLAY_ID);
      if (overlay) {
        map.removeOverlay(overlay);
      }
    }
  };

  const setDisplayStaticMeasurement = (
    enable: boolean,
    distanceUnit: DistanceUnit,
  ) => {
    removeFeatureMeasurementOverlays();
    if (!enable) {
      //To ensure no overlays are duplicated when toggling units between m and NM
      return;
    }
    const drawLayer = getDrawLayer();
    const source = drawLayer.getSource();
    if (!source) {
      return;
    }
    const drawnFeatures = source.getFeatures();
    drawnFeatures.forEach((feature) => {
      const geometry = feature.getGeometry();
      if (!geometry) {
        return;
      }
      const measurementText = getMeasurementText(
        geometry,
        mapProjection,
        distanceUnit,
      );

      addFeatureMeasurementOverlay(feature, measurementText);
    });
  };

  const getMeasurementOverlays = () => {
    const overlays = map.getOverlays().getArray();
    return overlays.filter((overlay) => {
      const overlayId = overlay.getId()?.toString();
      if (!overlayId) {
        return false;
      }
      return overlayId.startsWith(MEASUREMNT_OVERLAY_PREFIX);
    });
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
    elm.id = MEASUREMNT_ELEMENT_PREFIX + featId;
    elm.classList.add('ol-tooltip', 'ol-tooltip-measure', 'ol-tooltip-static');
    elm.innerHTML = text;

    const toolTip = new Overlay({
      element: elm,
      offset: [0, -15],
      positioning: 'bottom-center',
      id: MEASUREMNT_OVERLAY_PREFIX + featId,
    });

    toolTip.setPosition(overlayPosition);
    map.addOverlay(toolTip);
  };

  const removeFeatureMeasurementOverlays = () => {
    const overlays = getMeasurementOverlays();
    overlays.forEach((overlay) => {
      overlay.getElement()?.remove();
      map.removeOverlay(overlay);
    });
  };

  const setShowMeasurements = (enable: boolean) => {
    setShowMeasurementsAtom(enable);
    setDisplayInteractiveMeasurement(enable, distanceUnit);
    setDisplayStaticMeasurement(enable, distanceUnit);
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
    distanceUnit,
    showMeasurements,
    removeDrawnFeatureById,
    addFeature,
    setDrawLayerFeatures,
    setDrawEnabled,
    setDistanceUnit,
    setDrawType,
    setShowMeasurements,
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
