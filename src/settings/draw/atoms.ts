import { MaterialSymbol } from '@kvib/react';
import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { noModifierKeys, primaryAction } from 'ol/events/condition';
import BaseEvent from 'ol/events/Event';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Select from 'ol/interaction/Select';
import Translate from 'ol/interaction/Translate';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style, Text } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { v4 as uuidv4 } from 'uuid';
import {
  handleFeatureSelectDone,
  handleModifyEnd,
  handleModifyStart,
  handleSelect,
} from '../../draw/drawControls/hooks/drawEventHandlers';
import {
  addIconOverlayToPointFeature,
  DrawType,
} from '../../draw/drawControls/hooks/drawSettings';
import {
  getDrawInteraction,
  getSelectInteraction,
  getTranslateInteraction,
} from '../../draw/drawControls/hooks/mapInterations';
import { getDrawLayer } from '../../draw/drawControls/hooks/mapLayers';
import { getHighestZIndex } from '../../draw/drawControls/hooks/verticalMove';
import { mapAtom } from '../../map/atoms';
import { mapToolAtom } from '../../map/overlay/atoms';
import { addDrawAction } from './drawActions/drawActionsHooks';

export const DEFAULT_PRIMARY_COLOR = '#0e5aa0ff';
export const DEFAULT_SECONDARY_COLOR = '#1d823b80';

export type LineWidth = 2 | 4 | 8;

export type DistanceUnit = 'm' | 'NM';

export type TextFontSize = 12 | 16 | 24;

export const primaryColorAtom = atom<string>(DEFAULT_PRIMARY_COLOR);
export const secondaryColorAtom = atom<string>(DEFAULT_SECONDARY_COLOR);
export const lineWidthAtom = atom<LineWidth>(2);

export const drawStyleReadAtom = atom((get) => {
  const primaryColor = get(primaryColorAtom);
  const secondaryColor = get(secondaryColorAtom);
  const lineWidth = get(lineWidthAtom);
  return new Style({
    image: new CircleStyle({
      radius: lineWidth,
      fill: new Fill({
        color: secondaryColor,
      }),
    }),
    stroke: new Stroke({
      color: primaryColor,
      width: lineWidth,
    }),
    fill: new Fill({
      color: secondaryColor,
    }),
    zIndex: 0,
  });
});

export const drawTypeAtom = atom<DrawType | null>(null);
export const showMeasurementsAtom = atom<boolean>(false);
export const distanceUnitAtom = atom<DistanceUnit>('m');
export const pointIconAtom = atom<MaterialSymbol>('pin_drop');

export const textInputAtom = atom('');

export const textFontSizeAtom = atom<TextFontSize>(12);

export const textStyleReadAtom = atom((get) => {
  const textColor = get(primaryColorAtom);
  const backgroundColor = get(secondaryColorAtom);
  const fontSize = get(textFontSizeAtom);

  return new Style({
    text: new Text({
      font: `${fontSize}px Mulish`,
      fill: new Fill({ color: textColor }),
      backgroundFill: new Fill({ color: backgroundColor }),
    }),
  });
});

export const drawEnabledAtom = atom<boolean>((get) => {
  const currentMapTool = get(mapToolAtom);
  return currentMapTool === 'draw';
});

export const drawEnabledEffect = atomEffect((get, set) => {
  const drawEnabled = get(drawEnabledAtom);
  const store = getDefaultStore();
  const map = store.get(mapAtom);

  const drawInteraction = getDrawInteraction();
  const selectInteraction = getSelectInteraction();
  const translateInteraction = getTranslateInteraction();

  if (drawEnabled) {
    set(drawTypeAtom, 'Move');
  } else {
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
    }
    if (selectInteraction) {
      const features = selectInteraction.getFeatures();
      map.removeInteraction(selectInteraction);
      features.forEach(handleFeatureSelectDone);
    }
    if (translateInteraction) {
      map.removeInteraction(translateInteraction);
    }
  }
});

export const drawTypeEffect = atomEffect((get) => {
  const store = getDefaultStore();
  const drawType = get(drawTypeAtom);
  const draw = getDrawInteraction();
  const select = getSelectInteraction();
  const translate = getTranslateInteraction();
  const map = store.get(mapAtom);
  const drawLayer = getDrawLayer();

  const addSelectMoveInteractionToMap = () => {
    const selectInteraction = new Select({
      layers: [drawLayer],
      style: null,
    });
    selectInteraction.addEventListener('select', handleSelect);
    map.addInteraction(selectInteraction);

    const translateInteraction = new Translate({
      features: selectInteraction.getFeatures(),
    });

    translateInteraction.addEventListener('translatestart', handleModifyStart);
    translateInteraction.addEventListener('translateend', handleModifyEnd);

    const modifyInteraction = new Modify({
      features: selectInteraction.getFeatures(),
    });

    modifyInteraction.addEventListener('modifystart', handleModifyStart);
    modifyInteraction.addEventListener('modifyend', handleModifyEnd);
    map.addInteraction(translateInteraction);
    map.addInteraction(modifyInteraction);
  };

  const addDrawInteractionToMap = (type: DrawType) => {
    if (type === 'Move') {
      return;
    }
    const newDraw = new Draw({
      source: drawLayer.getSource() as VectorSource,
      type: type === 'Text' ? 'Point' : type,
      condition: (e) => noModifierKeys(e) && primaryAction(e),
    });

    const style = store.get(drawStyleReadAtom);
    newDraw.addEventListener('drawend', (_event: BaseEvent | Event) => {}); //Why this has to be here is beyond me
    newDraw.getOverlay().setStyle(style);
    newDraw.addEventListener('drawend', (event: BaseEvent | Event) => {
      drawEnd(event);
    });
    map.addInteraction(newDraw);
  };

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

  if (drawType === 'Move') {
    addSelectMoveInteractionToMap();
  } else if (drawType != null) {
    addDrawInteractionToMap(drawType);
  }
});

const drawEnd = (event: BaseEvent | Event) => {
  const drawEvent = event as DrawEvent;
  const eventFeature = drawEvent.feature;
  const store = getDefaultStore();
  const drawType = store.get(drawTypeAtom);
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
