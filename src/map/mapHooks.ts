import { useAtom, useAtomValue } from 'jotai';
import { View } from 'ol';
import BaseEvent from 'ol/events/Event';
import Draw, { DrawEvent } from 'ol/interaction/Draw.js';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import { get as getProjection, transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import { useRef } from 'react';
import {
  drawAtom,
  drawEnabledAtom,
  drawStyleAtom,
  mapAtom,
  modifyAtom,
  ProjectionIdentifier,
  snapAtom,
} from './atoms';
import { BackgroundLayer } from './layers';

export type DrawType = 'Point' | 'Polygon' | 'LineString' | 'Circle';

const useMap = () => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const map = useAtomValue(mapAtom);

  const setTargetElement = (element: HTMLDivElement | null) => {
    mapElement.current = element;
    if (!map.getTarget() && element) {
      map.setTarget(element);
    } else if (element == null) {
      map.setTarget(undefined);
    }
  };
  return { setTargetElement };
};

const useMapSettings = () => {
  const map = useAtomValue(mapAtom);
  const [draw, setDraw] = useAtom(drawAtom);
  const [drawStyle, setDrawStyleAtom] = useAtom(drawStyleAtom);
  const [snap, setSnap] = useAtom(snapAtom);
  const [modify, setModify] = useAtom(modifyAtom);
  const drawEnabled = useAtomValue(drawEnabledAtom);

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
      extent: projection.getExtent(),
    });

    map.setView(newView);
  };

  const toggleDrawEnabled = () => {
    if (drawEnabled) {
      if (draw) {
        map.removeInteraction(draw);
        setDraw(null);
      }

      if (snap) {
        map.removeInteraction(snap);
        setSnap(null);
      }

      if (modify) {
        map.removeInteraction(modify);
        setModify(null);
      }
      return;
    }

    const drawLayer = map
      .getLayers()
      .getArray()
      .filter(
        (layer) => layer.get('id') === 'drawLayer',
      )[0] as unknown as VectorLayer;

    const newDraw = new Draw({
      source: drawLayer.getSource() as VectorSource,
      type: 'Polygon',
      style: drawStyle,
    });

    newDraw.getOverlay().setStyle(drawStyle);

    const newSnap = new Snap({
      source: drawLayer.getSource() as VectorSource,
    });
    const newModify = new Modify({
      source: drawLayer.getSource() as VectorSource,
    });

    map.addInteraction(newModify);
    setModify(newModify);

    map.addInteraction(newSnap);
    setSnap(newSnap);

    map.addInteraction(newDraw);
    setDraw(newDraw);

    newDraw.addEventListener('drawend', (event) => drawEnd(event, drawStyle));
  };

  const setDrawType = (type: DrawType) => {
    if (draw) {
      map.removeInteraction(draw);
      const drawLayer = map
        .getLayers()
        .getArray()
        .filter(
          (layer) => layer.get('id') === 'drawLayer',
        )[0] as unknown as VectorLayer;

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
      setDraw(newDraw);
    }
  };

  const drawEnd = (event: BaseEvent | Event, style: Style) => {
    const eventFeature = (event as unknown as DrawEvent).feature;
    eventFeature.setStyle(style);
  };

  const setDrawStyle = (style: Style) => {
    if (draw) {
      draw.getOverlay().setStyle(style);
      draw.getListeners('drawend')?.forEach((listener) => {
        draw.removeEventListener('drawend', listener);
      });
      draw.addEventListener('drawend', (event) => drawEnd(event, style));
      setDrawStyleAtom(style);
    }
  };

  return {
    drawEnabled,
    drawStyle,
    setDrawType,
    setDrawStyle,
    toggleDrawEnabled,
    setBackgroundLayer,
    setProjection,
  };
};

export { useMap, useMapSettings };
