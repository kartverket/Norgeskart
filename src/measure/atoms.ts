import { atom } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { Feature } from 'ol';
import { getMeasureLayer } from '../draw/drawControls/hooks/mapLayers';
import { mapAtom } from '../map/atoms';

import Draw from 'ol/interaction/Draw';
import { addMeasureInteractionToMap } from './measureInteractions';
import { mapToolAtom } from '../map/overlay/atoms';

export type MeasureType = 'length' | 'area' | null;

export const measureTypeAtom = atom<MeasureType>(null);

export const selectedMeasureFeatureAtom = atom<Feature | null>(null);


export const measureEnabledEffect = atomEffect((get) => {
  const type = get(measureTypeAtom);
  const tool = get(mapToolAtom);
  const map = get(mapAtom);
  const layer = getMeasureLayer();


  map.getInteractions().forEach((interaction) => {
    if (interaction instanceof Draw) {
      map.removeInteraction(interaction);
    }
  });

  if (tool !== 'measure') {
    layer.getSource()?.clear();
    return;
  }

  const interaction = addMeasureInteractionToMap(
    type === 'length' ? 'LineString' : 'Polygon',
    layer,
    map,
  );

  map.addInteraction(interaction)
});
