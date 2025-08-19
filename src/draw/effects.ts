import { atomEffect } from 'jotai-effect';
import BaseEvent from 'ol/events/Event';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import Map from 'ol/Map';
import { Fill, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import {
  lineWidthAtom,
  mapAtom,
  primaryColorAtom,
  secondaryColorAtom,
} from '../map/atoms';

const getDrawInteraction = (map: Map) => {
  const drawInteraction = map
    .getInteractions()
    .getArray()
    .filter((interaction) => interaction instanceof Draw)[0] as
    | Draw
    | undefined;
  return drawInteraction;
};

const getDrawOverlayStyle = (draw: Draw) => {
  const style = draw.getOverlay()?.getStyle() as Style | null;
  return style;
};

const setNewStyle = (draw: Draw, style: Style) => {
  draw.getOverlay().setStyle(style);
  draw.getListeners('drawend')?.forEach((listener) => {
    draw.removeEventListener('drawend', listener);
  });
  draw.addEventListener('drawend', (event: Event | BaseEvent) => {
    const addedFeature = (event as DrawEvent).feature;
    addedFeature.setStyle(style);
  });
};

export const primaryColorEffect = atomEffect((get) => {
  const primaryColor = get(primaryColorAtom);
  const map = get(mapAtom);
  const drawInteraction = getDrawInteraction(map);
  if (!drawInteraction) {
    return;
  }
  const style = getDrawOverlayStyle(drawInteraction);
  if (!style) {
    return;
  }
  const newStyle = style.clone() as Style;

  newStyle.getFill()?.setColor(primaryColor);
  const circleStyle = new CircleStyle({
    radius: 5,
    fill: new Fill({ color: primaryColor }),
  });
  newStyle.setImage(circleStyle);

  setNewStyle(drawInteraction, newStyle);
});

export const secondaryColorEffect = atomEffect((get) => {
  const secondaryColor = get(secondaryColorAtom);
  const map = get(mapAtom);
  const drawInteraction = getDrawInteraction(map);
  if (!drawInteraction) {
    return;
  }

  const style = getDrawOverlayStyle(drawInteraction);
  if (!style) {
    return;
  }
  const newStyle = style.clone() as Style;

  newStyle.getStroke()?.setColor(secondaryColor);
  setNewStyle(drawInteraction, newStyle);
});

export const lineWidthEffect = atomEffect((get) => {
  const lineWidth = get(lineWidthAtom);
  const map = get(mapAtom);
  const drawInteraction = getDrawInteraction(map);
  if (!drawInteraction) {
    return;
  }
  const style = getDrawOverlayStyle(drawInteraction);
  if (!style) {
    return;
  }
  const newStyle = style.clone();
  newStyle.getStroke()?.setWidth(lineWidth);
  setNewStyle(drawInteraction, newStyle);
});
