import { atomEffect } from 'jotai-effect';
import Draw from 'ol/interaction/Draw';
import Map from 'ol/Map';
import { Fill, RegularShape, Style } from 'ol/style';
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

export const editPrimaryColorEffect = atomEffect((get) => {
  const primaryColor = get(primaryColorAtom);
  const map = get(mapAtom);
  const selectInteraction = getSelectInteraction(map);
  if (selectInteraction) {
    selectInteraction.getFeatures().forEach((feature) => {
      const featureStyle = feature.getStyle() as Style | undefined;
      if (!featureStyle) {
        return;
      }
      const currentStroke = featureStyle.getStroke();
      if (currentStroke) {
        currentStroke.setColor(primaryColor);
        featureStyle.setStroke(currentStroke);
      }

      const currentImage = featureStyle.getImage();
      if (currentImage) {
        if (
          currentImage instanceof CircleStyle ||
          currentImage instanceof RegularShape
        ) {
          currentImage.getFill()?.setColor(primaryColor);
          featureStyle.setImage(currentImage);
        }
      }
      feature.setStyle(featureStyle);
    });
  }
});

export const editSecondaryColorEffect = atomEffect((get) => {
  const secondaryColor = get(secondaryColorAtom);
  const map = get(mapAtom);
  const selectInteraction = getSelectInteraction(map);
  if (selectInteraction) {
    selectInteraction.getFeatures().forEach((feature) => {
      const featureStyle = feature.getStyle() as Style | undefined;
      if (!featureStyle) {
        return;
      }
      const currentFill = featureStyle.getFill();
      if (currentFill) {
        currentFill.setColor(secondaryColor);
        featureStyle.setFill(currentFill);
      }
      feature.setStyle(featureStyle);
    });
  }
});

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

  const overlayDrawStyle = getDrawOverlayStyle(drawInteraction);
  if (!overlayDrawStyle) {
    return;
  }

  if (drawType === 'Point') {
    const newStyle = get(pointStyleReadAtom);
    drawInteraction.getOverlay().setStyle(newStyle);
    return;
  }
  const newStyle = overlayDrawStyle.clone() as Style;

  newStyle.getFill()?.setColor(secondaryColor);
  newStyle.getStroke()?.setColor(primaryColor);
  newStyle.getStroke()?.setWidth(lineWidth);
  const circleStyle = new CircleStyle({
    radius: lineWidth,
    fill: new Fill({ color: primaryColor }),
  });
  newStyle.setImage(circleStyle);
  drawInteraction.getOverlay().setStyle(newStyle);
});
