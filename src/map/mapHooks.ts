import { useAtom, useAtomValue } from 'jotai';
import { View } from 'ol';
import MousePosition from 'ol/control/MousePosition';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import Draw, { DrawEvent } from 'ol/interaction/Draw.js';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import { get as getProjection, transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Fill } from 'ol/style';
import Style from 'ol/style/Style';
import { useEffect } from 'react';
import { selectedSearchResultAtom } from '../search/atoms.ts';
import {
  drawAtom,
  drawEnabledAtom,
  drawFillColorAtom,
  drawStrokeColorAtom,
  drawStyleAtom,
  mapAtom,
  modifyAtom,
  projectionAtom,
  ProjectionIdentifier,
  snapAtom,
} from './atoms';
import { BackgroundLayer } from './layers';
import { getMousePositionControl } from './mapControls';

export type DrawType = 'Point' | 'Polygon' | 'LineString' | 'Circle';

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
  const [draw, setDraw] = useAtom(drawAtom);
  const [drawStyle, setDrawStyleAtom] = useAtom(drawStyleAtom);
  const drawFillColor = useAtomValue(drawFillColorAtom);
  const drawStrokeColor = useAtomValue(drawStrokeColorAtom);
  const [snap, setSnap] = useAtom(snapAtom);
  const [modify, setModify] = useAtom(modifyAtom);
  const drawEnabled = useAtomValue(drawEnabledAtom);

  const setDrawEnabled = (enable: boolean) => {
    if (enable) {
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
    } else {
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
    }
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
    const drawLayer = map
      .getLayers()
      .getArray()
      .filter(
        (layer) => layer.get('id') === 'drawLayer',
      )[0] as unknown as VectorLayer;

    const source = drawLayer.getSource() as VectorSource;
    source.clear();
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
    clearDrawing,
  };
};

const useSelectedSearchResult = () => {
  const selectedResult = useAtomValue(selectedSearchResultAtom);
  const map = useAtomValue(mapAtom);

  console.log('Selected result:', selectedResult);

  useEffect(() => {
    if (!selectedResult || !map) return;

    const { lon, lat } = selectedResult;

    console.log('Lon:', lon, 'Lat:', lat);

    const view = map.getView();
    console.log('View instance:', view);

    const coords = transform(
      [lon, lat],
      'EPSG:4258',
      view.getProjection().getCode(),
    );
    console.log('Lon, Lat:', lon, lat);
    console.log('coords:', coords);
    console.log('Current view projection:', view.getProjection().getCode());
    view.setCenter(coords);
    view.setZoom(10);

    const extent = map.getView().get('extent');
    console.log('View extent:', extent);
  }, [selectedResult, map]);
};

export { useDrawSettings, useMap, useMapSettings, useSelectedSearchResult };