import { atomEffect } from 'jotai-effect';
import BaseEvent from 'ol/events/Event';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import Map from 'ol/Map';
import { Fill, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { mapAtom } from '../map/atoms';

import {
  drawTypeStateAtom,
  lineWidthAtom,
  pointStyleAtom,
  primaryColorAtom,
  secondaryColorAtom,
} from '../settings/draw/atoms';
import { getPointStyle } from './pointStyle';

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

  draw.addEventListener('drawend', (event: Event | BaseEvent) => {
    const addedFeature = (event as DrawEvent).feature;
    addedFeature.setStyle(style);
  });
};

export const drawStyleEffect = atomEffect((get) => {
  const primaryColor = get(primaryColorAtom);
  const secondaryColor = get(secondaryColorAtom);
  const lineWidth = get(lineWidthAtom);
  const map = get(mapAtom);
  const drawType = get(drawTypeStateAtom);
  const drawInteraction = getDrawInteraction(map);
  if (!drawInteraction) {
    return;
  }

  const style = getDrawOverlayStyle(drawInteraction);
  if (!style) {
    return;
  }

  if (drawType === 'Point') {
    const pointStyle = get(pointStyleAtom);
    const newStyle = getPointStyle(pointStyle);
    setNewStyle(drawInteraction, newStyle);
    return;
  }
  const newStyle = style.clone() as Style;

  newStyle.getFill()?.setColor(primaryColor);
  newStyle.getStroke()?.setColor(secondaryColor);
  newStyle.getStroke()?.setWidth(lineWidth);
  const circleStyle = new CircleStyle({
    radius: lineWidth,
    fill: new Fill({ color: primaryColor }),
  });
  newStyle.setImage(circleStyle);

  setNewStyle(drawInteraction, newStyle);
});
