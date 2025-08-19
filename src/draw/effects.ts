import { atomEffect } from 'jotai-effect';
import BaseEvent from 'ol/events/Event';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import { Fill, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { mapAtom, primaryColorAtom, secondaryColorAtom } from '../map/atoms';

export const primaryColorEffect = atomEffect((get) => {
  const primaryColor = get(primaryColorAtom);
  const map = get(mapAtom);
  const drawInteraction = map
    .getInteractions()
    .getArray()
    .filter((interaction) => interaction instanceof Draw)[0] as
    | Draw
    | undefined;
  if (!drawInteraction) {
    return;
  }

  const style = drawInteraction.getOverlay()?.getStyle() as Style | null;
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

  drawInteraction.getOverlay().setStyle(newStyle);
  drawInteraction.getListeners('drawend')?.forEach((listener) => {
    drawInteraction.removeEventListener('drawend', listener);
  });
  drawInteraction.addEventListener('drawend', (event: Event | BaseEvent) => {
    const addedFeature = (event as DrawEvent).feature;
    addedFeature.setStyle(newStyle);
  });
});

export const secondaryColorEffect = atomEffect((get) => {
  const secondaryColor = get(secondaryColorAtom);
  const map = get(mapAtom);
  const drawInteraction = map
    .getInteractions()
    .getArray()
    .filter((interaction) => interaction instanceof Draw)[0] as
    | Draw
    | undefined;
  if (!drawInteraction) {
    return;
  }

  const style = drawInteraction.getOverlay()?.getStyle() as Style | null;
  if (!style) {
    return;
  }
  const newStyle = style.clone() as Style;

  newStyle.getStroke()?.setColor(secondaryColor);
  drawInteraction.getOverlay().setStyle(newStyle);
  drawInteraction.getListeners('drawend')?.forEach((listener) => {
    drawInteraction.removeEventListener('drawend', listener);
  });
  drawInteraction.addEventListener('drawend', (event: Event | BaseEvent) => {
    const addedFeature = (event as DrawEvent).feature;
    addedFeature.setStyle(newStyle);
  });
});
