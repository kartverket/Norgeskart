import { MaterialSymbol } from '@kvib/react';
import { FeatureCollection, GeoJsonProperties } from 'geojson';
import { getDefaultStore, useAtom, useAtomValue } from 'jotai';
import { Feature, Overlay } from 'ol';
import { noModifierKeys, primaryAction } from 'ol/events/condition';
import BaseEvent from 'ol/events/Event';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Geometry, Point } from 'ol/geom';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify.js';
import Select from 'ol/interaction/Select';
import Translate from 'ol/interaction/Translate';
import VectorSource from 'ol/source/Vector';
import { Fill, RegularShape, Stroke, Style, Text } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { v4 as uuidv4 } from 'uuid';
import { StyleForStorage } from '../../../api/nkApiClient';
import { mapAtom, ProjectionIdentifier } from '../../../map/atoms';
import {
  drawEnabledAtom,
  drawStyleReadAtom,
  drawTypeStateAtom,
  lineWidthAtom,
  pointIconAtom,
  primaryColorAtom,
  showMeasurementsAtom,
  textInputAtom,
  textStyleReadAtom,
} from '../../../settings/draw/atoms';
import { useDrawActionsState } from '../../../settings/draw/drawActions/drawActionsHooks';
import { removeUrlParameter } from '../../../shared/utils/urlUtils';
import {
  addInteractiveMesurementOverlayToFeature,
  enableFeatureMeasurmentOverlay,
  removeFeaturelessInteractiveMeasurementOverlay,
  removeFeatureMeasurementOverlay,
  removeInteractiveMesurementOverlayFromFeature,
} from '../drawUtils';
import {
  handleFeatureSelectDone,
  handleModifyEnd,
  handleModifyStart,
  handleSelect,
} from './drawEventHandlers';
import { useMapInteractions } from './mapInterations';
import { useMapLayers } from './mapLayers';
import { useVerticalMove } from './verticalMove';

export const MEASUREMNT_OVERLAY_PREFIX = 'measurement-overlay-';
export const INTERACTIVE_OVERLAY_PREFIX = 'interactive-overlay-';
export const INTERACTIVE_MEASUREMNT_OVERLAY_ID =
  'interactive-measurement-tooltip';
export const ICON_OVERLAY_PREFIX = 'icon-overlay-';
export const MEASUREMNT_ELEMENT_PREFIX = 'measurement-tooltip-';

export type FeatureMoveDetail = {
  featureId: string;
  geometryBeforeMove: Geometry;
  geometryAfterMove: Geometry;
};

export type PointIcon = {
  icon: MaterialSymbol;
  color: string;
  size: number;
};

export type DrawType =
  | 'Point'
  | 'Polygon'
  | 'LineString'
  | 'Circle'
  | 'Move'
  | 'Text';

const useDrawSettings = () => {
  const map = useAtomValue(mapAtom);
  const [drawType, setDrawTypeState] = useAtom(drawTypeStateAtom);
  const [drawEnabled, setDrawAtomEnabled] = useAtom(drawEnabledAtom);
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
        features.forEach(handleFeatureSelectDone);
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
      features.forEach(handleFeatureSelectDone);
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
        style: null,
      });
      selectInteraction.addEventListener('select', handleSelect);
      map.addInteraction(selectInteraction);

      const translateInteraction = new Translate({
        features: selectInteraction.getFeatures(),
      });

      translateInteraction.addEventListener(
        'translatestart',
        handleModifyStart,
      );
      translateInteraction.addEventListener('translateend', handleModifyEnd);

      const modifyInteraction = new Modify({
        features: selectInteraction.getFeatures(),
      });

      modifyInteraction.addEventListener('modifystart', handleModifyStart);
      modifyInteraction.addEventListener('modifyend', handleModifyEnd);
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

  const getDrawnFeatures = () => {
    return getDrawLayer()?.getSource()?.getFeatures() as
      | Feature<Geometry>[]
      | undefined;
  };

  const drawEnd = (event: BaseEvent | Event) => {
    const drawEvent = event as DrawEvent;
    const eventFeature = drawEvent.feature;
    const store = getDefaultStore();
    const drawType = store.get(drawTypeStateAtom);
    const zIndex = getHighestZIndex() + 1;
    const featureId = uuidv4();
    eventFeature.setId(featureId);
    if (drawType === 'Point') {
      const icon = store.get(pointIconAtom);
      if (icon) {
        const pointIcon = {
          icon: icon,
          color: store.get(primaryColorAtom),
          size: store.get(lineWidthAtom),
        };
        addIconOverlayToPointFeature(eventFeature, pointIcon);
      }
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
      style.setZIndex(zIndex);
      eventFeature.setStyle(style);
    }

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

    const fill = styleFromProps.fill?.color
      ? new Fill({ color: styleFromProps.fill.color })
      : undefined;

    const stroke = styleFromProps.stroke?.color
      ? new Stroke({
          color: styleFromProps.stroke.color,
          width: styleFromProps.stroke.width ?? 2,
        })
      : undefined;

    const icon =
      styleFromProps.icon?.points != null
        ? new RegularShape({
            points: styleFromProps.icon.points,
            radius: styleFromProps.icon.radius ?? 10,
            radius2: styleFromProps.icon.radius2,
            angle: styleFromProps.icon.angle,
            scale: styleFromProps.icon.scale,
            fill: new Fill({ color: styleFromProps.icon.color }),
          })
        : styleFromProps.icon?.radius != null &&
            styleFromProps.icon?.color != null
          ? new CircleStyle({
              radius: styleFromProps.icon.radius,
              fill: new Fill({ color: styleFromProps.icon.color }),
            })
          : undefined;

    const textValue =
      (styleFromProps.text as { text?: string; value?: string })?.text ??
      (styleFromProps.text as { text?: string; value?: string })?.value;
    const text = textValue
      ? new Text({
          text: textValue,
          font: styleFromProps.text?.font ?? '16px sans-serif',
          fill: styleFromProps.text?.fillColor
            ? new Fill({ color: styleFromProps.text.fillColor })
            : new Fill({ color: '#000000' }),
          stroke: styleFromProps.text?.stroke?.color
            ? new Stroke({
                color: styleFromProps.text.stroke.color,
                width: styleFromProps.text.stroke.width ?? 1,
              })
            : undefined,
          backgroundFill: styleFromProps.text?.backgroundFillColor
            ? new Fill({ color: styleFromProps.text.backgroundFillColor })
            : undefined,
          offsetY: -15,
          textAlign: 'center',
          textBaseline: 'bottom',
        })
      : undefined;

    if (!fill && !stroke && !icon && !text) {
      return null;
    }

    const style = new Style({
      fill,
      stroke,
      image: icon,
      text,
    });

    return style;
  };

  const getOverlayIconFromProperties = (
    properties: GeoJsonProperties,
  ): PointIcon | null => {
    const iconFromProps = properties?.overlayIcon as PointIcon | null;
    return iconFromProps;
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
      removeFeatureMeasurementOverlay(feature);
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
    if (showMeasurements) {
      enableFeatureMeasurmentOverlay(feature);
    }
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
          const featureStyle = getStyleFromProperties(feature.properties);
          if (transformedGeometry) {
            const newFeature = new Feature({
              geometry: transformedGeometry,
            });
            const featureId = uuidv4();
            newFeature.setId(featureId);
            if (featureStyle) {
              newFeature.setStyle(featureStyle);
            }
            featuresToAddWithStyle.push(newFeature);
          }
        });
      } else {
        const transformedGeometry = geometryOriginalProjection
          .getGeometry()
          ?.transform(sourceProjection, mapProjection);
        const featureStyle = getStyleFromProperties(feature.properties);
        const overlayIcon = getOverlayIconFromProperties(feature.properties);

        if (transformedGeometry) {
          const newFeature = new Feature({
            geometry: transformedGeometry,
          });
          const featureId = uuidv4();
          newFeature.setId(featureId);
          if (featureStyle) {
            newFeature.setStyle(featureStyle);
          }
          if (overlayIcon) {
            newFeature.setProperties({
              overlayIcon: overlayIcon,
            });
          }
          featuresToAddWithStyle.push(newFeature);
        }
      }
    });
    drawSource.clear();
    drawSource.addFeatures(featuresToAddWithStyle);
    featuresToAddWithStyle.forEach((f) => {
      const iconProps = f.getProperties()['overlayIcon'];
      if (iconProps != null && f.getGeometry() instanceof Point) {
        addIconOverlayToPointFeature(f, iconProps);
      }
    });

    if (showMeasurements) {
      featuresToAddWithStyle.forEach((feature) => {
        enableFeatureMeasurmentOverlay(feature);
      });
    }
  };

  const setDisplayInteractiveMeasurementForDrawInteraction = (
    enable: boolean,
  ) => {
    const drawInteraction = getDrawInteraction();
    if (!drawInteraction) {
      return;
    }
    const drawStartMesurmentListener = (event: BaseEvent | Event) => {
      const eventFeature = (event as unknown as DrawEvent).feature;
      addInteractiveMesurementOverlayToFeature(eventFeature);
    };
    const drawEndMesurmentListener = (event: BaseEvent | Event) => {
      const eventFeature = (event as unknown as DrawEvent).feature;
      removeInteractiveMesurementOverlayFromFeature(eventFeature);
      enableFeatureMeasurmentOverlay(eventFeature);
      removeFeaturelessInteractiveMeasurementOverlay();
    };

    if (enable) {
      drawInteraction.on('drawstart', drawStartMesurmentListener);
      drawInteraction.on('drawend', drawEndMesurmentListener);
    } else {
      drawInteraction.un('drawstart', drawStartMesurmentListener);
      drawInteraction.un('drawend', drawEndMesurmentListener);
    }
  };

  const setDisplayStaticMeasurement = (enable: boolean) => {
    removeFeatureMeasurementOverlays();
    if (!enable) {
      return;
    }
    const drawLayer = getDrawLayer();
    const source = drawLayer.getSource();
    if (!source) {
      return;
    }
    const drawnFeatures = source.getFeatures();
    drawnFeatures.forEach(enableFeatureMeasurmentOverlay);
  };

  const getMeasurementOverlays = () => {
    const overlays = map.getOverlays().getArray();
    return overlays.filter((overlay) => {
      const overlayId = overlay.getId()?.toString();
      if (!overlayId) {
        return false;
      }
      return (
        overlayId.startsWith(MEASUREMNT_OVERLAY_PREFIX) ||
        overlayId.startsWith(INTERACTIVE_OVERLAY_PREFIX)
      );
    });
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
    setDisplayStaticMeasurement(enable);
    setDisplayInteractiveMeasurementForDrawInteraction(enable);
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

  const clearDrawing = async () => {
    setShowMeasurements(false);
    const overlays = [...map.getOverlays().getArray()];
    overlays.forEach((overlay) => {
      if (overlay == null) {
        return;
      }
      const overlayId = overlay.getId();
      if (
        typeof overlayId === 'string' &&
        (overlayId.startsWith(ICON_OVERLAY_PREFIX) ||
          overlayId.startsWith(MEASUREMNT_OVERLAY_PREFIX) ||
          overlayId.startsWith(INTERACTIVE_OVERLAY_PREFIX))
      ) {
        overlay.getElement()?.remove();
        map.removeOverlay(overlay);
      }
    });
    const drawLayer = getDrawLayer();
    const source = drawLayer.getSource() as VectorSource;
    source.clear();
    resetActions();
    removeUrlParameter('drawing');
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

export const addIconOverlayToPointFeature = (
  feature: Feature,
  icon: PointIcon,
) => {
  const point = feature.getGeometry();
  if (!point || !(point instanceof Point)) {
    return;
  }
  const map = getDefaultStore().get(mapAtom);
  const featureId = feature.getId();
  const pointCoordinates = point.getCoordinates();
  const elm = document.createElement('i');
  elm.classList.add('material-symbols-rounded');
  elm.style.color = icon.color;
  elm.style.fontSize = `${icon.size * 10}px`;
  elm.style.userSelect = 'none';
  elm.style.pointerEvents = 'none';
  elm.textContent = icon.icon;
  const overlayId = `${ICON_OVERLAY_PREFIX}${featureId}`;
  const existingOverlay = map.getOverlayById(overlayId);
  if (existingOverlay) {
    existingOverlay.getElement()?.remove();
    map.removeOverlay(existingOverlay);
  }

  const overlay = new Overlay({
    element: elm,
    position: pointCoordinates,
    positioning: 'center-center',
    stopEvent: false,
    id: overlayId,
  });
  map.addOverlay(overlay);
  point.setProperties({
    overlayIcon: icon,
  });
  feature.on('change', () => {
    const geom = feature.getGeometry();
    if (geom && geom instanceof Point) {
      const coords = geom.getCoordinates();
      overlay.setPosition(coords);
    }
  });
  feature.setStyle(
    new Style({
      image: new CircleStyle({
        radius: icon.size * 5, //To make the overlay area easier to click on
        fill: new Fill({ color: 'transparent' }),
        stroke: new Stroke({ color: 'transparent', width: 0 }),
      }),
    }),
  );
};
