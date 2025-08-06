import { useAtom, useAtomValue } from 'jotai';
import { Overlay } from 'ol';
import BaseEvent from 'ol/events/Event';
import { Circle, LineString, Polygon } from 'ol/geom';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import Select from 'ol/interaction/Select';
import Translate from 'ol/interaction/Translate';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Style } from 'ol/style';
import {
  drawEnabledAtom,
  drawFillColorAtom,
  drawStrokeColorAtom,
  drawStyleAtom,
  mapAtom,
} from '../map/atoms';

export type DrawType = 'Point' | 'Polygon' | 'LineString' | 'Circle' | 'Move';

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
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
    }
    if (enable) {
      setDrawType('Polygon');
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
      map.addInteraction(translateInteraction);
      return;
    }

    const drawLayer = getDrawLayer();

    const newDraw = new Draw({
      source: drawLayer.getSource() as VectorSource,
      type: type,
    });

    map.addInteraction(newDraw);

    if (drawStyle) {
      newDraw.getOverlay().setStyle(drawStyle);
      newDraw.addEventListener('drawend', (event) => drawEnd(event, drawStyle));
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

  const setShowMeasurements = (enable: boolean) => {
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
          const gemoetry = geomEvent.target;

          if (gemoetry instanceof Polygon) {
            const area = gemoetry.getArea();
            console.log(`Area: ${area}`);
          }
          if (gemoetry instanceof LineString) {
            const length = gemoetry.getLength();
            console.log(`Length: ${length}`);
          }
          if (gemoetry instanceof Circle) {
            const radius = gemoetry.getRadius();
            console.log(`Radius: ${radius}`);
          }
        });
      });
    } else {
      map.getViewport().removeEventListener('mouseout', handleMouseOut);
      drawInteraction.getListeners('drawstart')?.forEach((listener) => {
        drawInteraction.removeEventListener('drawstart', listener);
      });
      const overlay = map.getOverlayById('measurement-tooltip');
      if (overlay) {
        map.removeOverlay(overlay);
      }
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
    setShowMeasurements,
    abortDrawing,
    clearDrawing,
    getDrawLayer,
  };
};

export { useDrawSettings };
