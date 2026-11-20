import { atom } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { getMeasureLayer } from '../draw/drawControls/hooks/mapLayers';
import { mapAtom } from '../map/atoms';

import { mapToolAtom } from '../map/overlay/atoms';
import {
  addMeasureInteractionToMap,
  removeMeasureInteractionsFromMap,
} from './measureInteractions';

export type MeasureType = 'length' | 'area' | null;

export const measureTypeAtom = atom<MeasureType>(null);

export const measureEnabledEffect = atomEffect((get) => {
  const type = get(measureTypeAtom);
  const tool = get(mapToolAtom);
  const map = get(mapAtom);
  const layer = getMeasureLayer();

  if (tool !== 'measure') {
    layer.getSource()?.clear();
    removeMeasureInteractionsFromMap(map);
    return;
  }
  const timeoutId = setTimeout(() => {
    addMeasureInteractionToMap(
      type === 'length' ? 'LineString' : 'Polygon',
      layer,
      map,
    );
  });

  return () => clearTimeout(timeoutId);
});
