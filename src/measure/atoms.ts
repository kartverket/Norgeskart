import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { Feature } from 'ol';
import { getMeasureLayer } from '../draw/drawControls/hooks/mapLayers';
import { mapAtom } from '../map/atoms';

import { addMeasureInteractionToMap } from './measureInteractions';

export type MeasureType = 'length' | 'area' | null;

export const measureTypeAtom = atom<MeasureType>(null);

export const selectedMeasureFeatureAtom = atom<Feature | null>(null);

export const measureEnabledEffect = atomEffect((get, set) => {
  const type = get(measureTypeAtom);

  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const measureLayer = getMeasureLayer();

  if (!type) {
    measureLayer.getSource()?.clear();
    return;
  }

  if (type === 'length') {
    addMeasureInteractionToMap('LineString', measureLayer, map);
  }

  if (type === 'area') {
    addMeasureInteractionToMap('Polygon', measureLayer, map);
  }
});
