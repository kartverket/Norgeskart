import { atom } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { Feature } from 'ol';
import { getMeasureLayer } from '../draw/drawControls/hooks/mapLayers';
import { mapAtom } from '../map/atoms';

import { addMeasureInteractionToMap } from './measureInteractions';
import Draw from 'ol/interaction/Draw';

export type MeasureType = 'length' | 'area' | null;

export const measureTypeAtom = atom<MeasureType>(null);

export const selectedMeasureFeatureAtom = atom<Feature | null>(null);

let current: Draw | null = null;


export const measureEnabledEffect = atomEffect((get) => {
  const type = get(measureTypeAtom);
  const map = get(mapAtom); 
  const layer = getMeasureLayer();

  if (current) {
    map.removeInteraction(current);
    current = null;
  }

  if (!type) {
    layer.getSource()?.clear();
    return;
  }

  current = addMeasureInteractionToMap(
    type === 'length' ? 'LineString' : 'Polygon',
    layer,
    map,
  );
});