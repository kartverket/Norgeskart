import { atomEffect } from 'jotai-effect';
import Draw from 'ol/interaction/Draw';
import Map from 'ol/Map';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { mapAtom } from '../map/atoms';

import Select from 'ol/interaction/Select';
import {
  drawTypeStateAtom,
  lineWidthAtom,
  pointStyleReadAtom,
  primaryColorAtom,
  secondaryColorAtom,
} from '../settings/draw/atoms';

const getDrawInteraction = (map: Map) => {
  const drawInteraction = map
    .getInteractions()
    .getArray()
    .filter((interaction) => interaction instanceof Draw)[0] as
    | Draw
    | undefined;
  return drawInteraction;
};

const getSelectInteraction = (map: Map) => {
  const selectInteraction = map
    .getInteractions()
    .getArray()
    .filter((interaction) => interaction instanceof Select)[0] as
    | Select
    | undefined;
  return selectInteraction;
};

const getDrawOverlayStyle = (draw: Draw) => {
  const style = draw.getOverlay()?.getStyle() as Style | null;
  return style;
};

export const drawStyleEffect = atomEffect((get) => {
  const primaryColor = get(primaryColorAtom);
  const secondaryColor = get(secondaryColorAtom);
  const lineWidth = get(lineWidthAtom);
  const map = get(mapAtom);
  const drawType = get(drawTypeStateAtom);
  const drawInteraction = getDrawInteraction(map);
  const selectInteraction = getSelectInteraction(map);
  const pointStyle = get(pointStyleReadAtom);

  if (selectInteraction) {
    selectInteraction.getFeatures().forEach((feature) => {
      const currentStyle = feature.getStyle() as Style | undefined;
      if (!currentStyle) {
        return;
      }
      currentStyle.setFill(new Fill({ color: primaryColor }));
      currentStyle.setStroke(
        new Stroke({ color: secondaryColor, width: lineWidth }),
      );
      const circleStyle = new CircleStyle({
        radius: lineWidth,
        fill: new Fill({ color: primaryColor }),
      });
      currentStyle.setImage(pointStyle.getImage() || circleStyle);

      feature.setStyle(currentStyle);
    });
  }
  if (!drawInteraction) {
    return;
  }

  const style = getDrawOverlayStyle(drawInteraction);
  if (!style) {
    return;
  }

  if (drawType === 'Point') {
    const newStyle = get(pointStyleReadAtom);
    drawInteraction.getOverlay().setStyle(newStyle);
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
  drawInteraction.getOverlay().setStyle(newStyle);
});
