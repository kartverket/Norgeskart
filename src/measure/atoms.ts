import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { Feature } from 'ol';
import { getMeasureLayer } from '../draw/drawControls/hooks/mapLayers';
import { mapAtom } from '../map/atoms';
import {
  addDrawInteractionToMap,
  clearInteractions,
  setDisplayInteractiveMeasurementForDrawInteraction,
  showMeasurementsAtom,
} from '../settings/draw/atoms';

export type MeasureType = 'length' | 'area' | null;

export const measureTypeAtom = atom<MeasureType>(null);

export const selectedMeasureFeatureAtom = atom<Feature | null>(null);

export const measureEnabledEffect = atomEffect((get, set) => {
  const type = get(measureTypeAtom);

  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const measureLayer = getMeasureLayer();

  clearInteractions();
    


  if (!type) {
    set(showMeasurementsAtom, false);

    measureLayer.getSource()?.clear();


    return;
  }

  set(showMeasurementsAtom, true);

  if (type === 'length') {
    addDrawInteractionToMap('LineString', measureLayer, map);
  }

  if (type === 'area') {
    addDrawInteractionToMap('Polygon', measureLayer, map);
  }

  setDisplayInteractiveMeasurementForDrawInteraction(true);
});
