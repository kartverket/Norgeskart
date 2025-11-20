import { atom } from 'jotai';
import { atomEffect } from 'jotai-effect';
import {
  clearUrlParameter,
  setListUrlParameter,
} from '../../shared/utils/urlUtils';
import { ThemeLayerName } from './themeWMS';

export const themeLayersAtom = atom<ThemeLayerName[]>([]);

export const themLayersAtomEffect = atomEffect((get) => {
  const layers = get(themeLayersAtom);
  if (layers.length !== 0) {
    setListUrlParameter('themeLayers', layers);
    return;
  } else {
    clearUrlParameter('themeLayers');
  }
});
