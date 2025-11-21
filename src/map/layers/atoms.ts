import { XMLParser } from 'fast-xml-parser';
import { atom } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { loadable } from 'jotai/utils';
import {
  clearUrlParameter,
  setListUrlParameter,
} from '../../shared/utils/urlUtils';
import { StyledLayerDescriptor } from '../types/StyledLayerDescriptor';
import { getThemeWMSLayerStyleUrl, ThemeLayerName } from './themeWMS';

const parser = new XMLParser({ removeNSPrefix: true });

export const themeLayersAtom = atom<ThemeLayerName[]>([]);
const themeLayersSymbolologyAtom = atom(async (get) => {
  const layers = get(themeLayersAtom);
  const styleMap = new Map<
    ThemeLayerName,
    { StyledLayerDescriptor: StyledLayerDescriptor }
  >();
  const styleData = await Promise.all(
    layers.map(async (layer) => {
      const url = getThemeWMSLayerStyleUrl(layer);
      if (url == null) {
        return;
      }
      const res = await fetch(url);
      const text = await res.text();
      return {
        layerName: layer,
        styleObject: parser.parse(text),
      };
    }),
  );

  styleData.forEach((data) => {
    if (data) {
      styleMap.set(data.layerName, data.styleObject);
    }
  });
  return styleMap;
});

export const themeLayerStyles = loadable(themeLayersSymbolologyAtom);
export const themLayersAtomEffect = atomEffect((get) => {
  const layers = get(themeLayersAtom);
  if (layers.length !== 0) {
    setListUrlParameter('themeLayers', layers);
    return;
  } else {
    clearUrlParameter('themeLayers');
  }
});
