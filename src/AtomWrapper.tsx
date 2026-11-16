import { useHydrateAtoms } from 'jotai/utils';
import 'material-symbols/rounded.css';
import { ReactNode } from 'react';
import './index.css';
import { activeThemeLayersAtom } from './map/layers/atoms.ts';
import { BackgroundLayerName } from './map/layers/backgroundLayers.ts';
import { backgroundLayerAtom } from './map/layers/config/backgroundLayers/atoms.ts';
import { ThemeLayerName } from './map/layers/themeWMS.ts';
import {
  getListUrlParameter,
  getUrlParameter,
} from './shared/utils/urlUtils.ts';

export const AtomWrapper = ({ children }: { children: ReactNode }) => {
  const initialThemeLayersList = getListUrlParameter('themeLayers') || [];
  const initialThemeLayers = new Set(
    initialThemeLayersList as ThemeLayerName[],
  );
  const layerNameFromUrl = getUrlParameter('backgroundLayer');
  const finalLayerName = (layerNameFromUrl || 'topo') as BackgroundLayerName;

  useHydrateAtoms([
    [activeThemeLayersAtom, initialThemeLayers],
    [backgroundLayerAtom, finalLayerName],
  ]);
  return children;
};
