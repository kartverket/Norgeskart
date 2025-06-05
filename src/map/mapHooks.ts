import { useAtom, useAtomValue } from 'jotai';
import { View } from 'ol';
import MousePosition from 'ol/control/MousePosition';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import Draw, { DrawEvent } from 'ol/interaction/Draw.js';
import Select from 'ol/interaction/Select';
import Translate from 'ol/interaction/Translate';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import { get as getProjection, transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Fill } from 'ol/style';
import Style from 'ol/style/Style';
import {
  drawEnabledAtom,
  drawFillColorAtom,
  drawStrokeColorAtom,
  drawStyleAtom,
  mapAtom,
  projectionAtom,
  ProjectionIdentifier,
} from './atoms';
import { BackgroundLayer } from './layers';
import { getMousePositionControl } from './mapControls';

export type DrawType = 'Point' | 'Polygon' | 'LineString' | 'Circle' | 'Move';

const useMap = () => {
  const map = useAtomValue(mapAtom);

  const setTargetElement = (element: HTMLDivElement | null) => {
    if (!map.getTarget() && element) {
      map.setTarget(element);
    } else if (element == null) {
      map.setTarget(undefined);
    }
  };

  const mapElement = map.getTarget() as HTMLElement | undefined;
  return { mapElement, setTargetElement };
};

const useMapSettings = () => {
  const map = useAtomValue(mapAtom);
  const projection = useAtomValue(projectionAtom);

  const getMapViewCenter = () => {
    const view = map.getView();
    return view.getCenter();
  };

  const setBackgroundLayer = (layerName: BackgroundLayer) => {
    const backgroundLayers = map
      .getLayers()
      .getArray()
      .filter(
        (layer) => layer.get('id') === 'backgroundLayers',
      )[0] as unknown as LayerGroup;

    backgroundLayers.getLayers().forEach((layer) => {
      if (layer.get('id') === layerName) {
        layer.setVisible(true);
      } else {
        layer.setVisible(false);
      }
    });
  };

  const setProjection = (projectionId: ProjectionIdentifier) => {
    const projection = getProjection(projectionId)!;

    // Optionally, transform the current center to the new projection
    const oldView = map.getView();
    const oldCenter = oldView.getCenter();
    const oldProjection = oldView.getProjection();

    let newCenter = undefined;
    if (
      oldCenter &&
      oldProjection &&
      oldProjection.getCode() !== projection.getCode()
    ) {
      // Transform center to new projection
      newCenter = transform(oldCenter, oldProjection, projection);
    }

    // Create a new view with the new projection
    const newView = new View({
      center: newCenter || [570130, 7032300], // fallback center if needed
      zoom: oldView.getZoom(),
      projection: projection,
      extent: projection.getExtent() as Extent,
    });

    map.setView(newView);

    const mousePositionInteraction = map
      .getControls()
      .getArray()
      .filter((control) => {
        return control instanceof MousePosition;
      })[0];
    map.removeControl(mousePositionInteraction);
    map.addControl(getMousePositionControl(projectionId));
  };

  const setMapFullScreen = (shouldBeFullscreen: boolean) => {
    if (!document.fullscreenEnabled) {
      return;
    }
    const mapElement = map.getTarget() as HTMLElement | undefined;
    if (!mapElement) {
      return;
    }
    if (shouldBeFullscreen) {
      mapElement
        .requestFullscreen()
        .catch((err) =>
          console.error('Error attempting to enable full-screen mode:', err),
        );
    } else {
      document.exitFullscreen();
    }
  };

  const setMapLocation = (
    location: [number, number],
    locationProjection: string | null = null,
    zoomLevel: number | null = null,
  ) => {
    const sourceProjection = getProjection(
      locationProjection || projection.getCode(),
    );
    if (!sourceProjection) {
      console.error(`Projection ${locationProjection} not found`);
      return;
    }
    const transformedLocation = transform(
      location,
      sourceProjection,
      map.getView().getProjection(),
    );
    map.getView().setCenter(transformedLocation);
    if (zoomLevel !== null) {
      map.getView().setZoom(zoomLevel);
    }
  };

  return {
    projection,
    getMapViewCenter,
    setMapFullScreen,
    setBackgroundLayer,
    setProjection,
    setMapLocation,
  };
};

const useDrawSettings = () => {
  const map = useAtomValue(mapAtom);
  const [drawStyle, setDrawStyleAtom] = useAtom(drawStyleAtom);
  const drawFillColor = useAtomValue(drawFillColorAtom);
  const drawStrokeColor = useAtomValue(drawStrokeColorAtom);
  const [drawEnabled, setDrawAtomEnabled] = useAtom(drawEnabledAtom);

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

    if (!drawInteraction) {
      console.error('Not draw interaction found on map');
      return;
    }
    drawInteraction.setActive(enable);
    setDrawAtomEnabled(enable);
  };

  const setDrawType = (type: DrawType) => {
    const draw = getDrawInteraction();
    const select = getSelectInteraction();
    const translate = getTranslateInteraction();

    if (type === 'Move') {
      draw?.setActive(false);
      select?.setActive(true);
      translate?.setActive(true);
      return;
    }

    if (draw) {
      select?.setActive(false);
      translate?.setActive(false);
      const drawLayer = getDrawLayer();
      map.removeInteraction(draw);

      const newDraw = new Draw({
        source: drawLayer.getSource() as VectorSource,
        type: type,
      });

      map.addInteraction(newDraw);

      if (drawStyle) {
        newDraw.getOverlay().setStyle(drawStyle);
        newDraw.addEventListener('drawend', (event) =>
          drawEnd(event, drawStyle),
        );
      }
    }
  };

  const drawEnd = (event: BaseEvent | Event, style: Style) => {
    const eventFeature = (event as unknown as DrawEvent).feature;
    eventFeature.setStyle(style);
  };

  const setDrawFillColor = (color: string) => {
    const style = drawStyle.clone();
    style.setFill(new Fill({ color }));
    setDrawStyle(style);
  };
  const setDrawStrokeColor = (color: string) => {
    const style = drawStyle.clone();
    style.getStroke()?.setColor(color);
    setDrawStyle(style);
  };

  const setDrawStyle = (style: Style) => {
    const draw = getDrawInteraction();
    if (draw) {
      draw.getOverlay().setStyle(style);
      draw.getListeners('drawend')?.forEach((listener) => {
        draw.removeEventListener('drawend', listener);
      });
      draw.addEventListener('drawend', (event) => drawEnd(event, style));
      setDrawStyleAtom(style);
    }
  };

  const clearDrawing = () => {
    const drawLayer = getDrawLayer();
    const source = drawLayer.getSource() as VectorSource;
    source.clear();
  };

  const abortDrawing = () => {
    const drawInteraction = getDrawInteraction();
    if (drawInteraction) {
      drawInteraction.abortDrawing();
    }
  };

  return {
    drawEnabled,
    drawStyle,
    drawFillColor,
    drawStrokeColor,
    setDrawEnabled,
    setDrawType,
    setDrawFillColor,
    setDrawStrokeColor,
    abortDrawing,
    clearDrawing,
  };
};

export { useDrawSettings, useMap, useMapSettings };
