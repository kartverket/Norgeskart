import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import {
  getThemeLayerById,
  themeLayerConfigLoadableAtom,
} from '../../api/themeLayerConfigApi';
import { addToUrlListParameter } from '../../shared/utils/urlUtils';
import { mapAtom } from '../atoms';
import { BackgroundLayerName } from './backgroundLayers';
import { DEFAULT_BACKGROUND_LAYER } from './backgroundWMTSProviders';
import { createThemeLayerFromConfig, ThemeLayerName } from './themeWMS';

export const activeBackgroundLayerAtom = atom<BackgroundLayerName>(
  DEFAULT_BACKGROUND_LAYER,
);

export const activeThemeLayersAtom = atom<Set<ThemeLayerName>>(
  new Set<ThemeLayerName>(),
);

export const themeLayerEffect = atomEffect((get) => {
  const themeLayers = get(activeThemeLayersAtom);
  const configLoadable = get(themeLayerConfigLoadableAtom);
  if (configLoadable.state !== 'hasData') {
    console.warn('Theme layer config not loaded yet');
    return;
  }
  const map = getDefaultStore().get(mapAtom);
  const mapProjection = map.getView().getProjection().getCode();

  themeLayers.forEach((layerName) => {
    const layerExists = map
      .getLayers()
      .getArray()
      .some((layer) => layer.get('id') === `theme.${layerName}`);
    if (layerExists) {
      console.warn('Layer already exists on map');
      return;
    }

    const layerDef = getThemeLayerById(configLoadable.data, layerName);

    if (!layerDef) {
      console.warn(`Layer definition not found for layer name: ${layerName}`);
      return;
    }

    const layerToAdd = createThemeLayerFromConfig(
      configLoadable.data,
      layerDef,
      mapProjection,
    );

    if (!layerToAdd) {
      console.warn(
        `Could not create theme layer: ${layerName} for projection: ${mapProjection}`,
      );
      return;
    }
    layerToAdd.setZIndex(10);
    map.addLayer(layerToAdd);
    addToUrlListParameter('themeLayers', layerName);
  });
  return;
});
