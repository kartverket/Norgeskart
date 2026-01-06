import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import {
  getThemeLayerById,
  themeLayerConfigAtom,
} from '../../api/themeLayerConfigApi';
import {
  addToUrlListParameter,
  removeFromUrlListParameter,
} from '../../shared/utils/urlUtils';
import { mapAtom } from '../atoms';
import {
  featureInfoPanelOpenAtom,
  featureInfoResultAtom,
} from '../featureInfo/atoms';
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
  const themeLayerConfig = get(themeLayerConfigAtom);
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const mapProjection = map.getView().getProjection().getCode();
  const themelayersActive = new Set(
    map
      .getLayers()
      .getArray()
      .filter((layer) => {
        const id = layer.get('id');
        return typeof id === 'string' && id.startsWith('theme.');
      })
      .map((layer) => layer.get('id').substring(6) as ThemeLayerName),
  );

  const themeLayersToAdd = Array.from(themeLayers).filter(
    (layerName) => !themelayersActive.has(layerName),
  );
  const themeLayersToRemove = Array.from(themelayersActive).filter(
    (layerName) => !themeLayers.has(layerName),
  );

  themeLayersToAdd.forEach((layerName) => {
    const layerExists = map
      .getLayers()
      .getArray()
      .some((layer) => layer.get('id') === `theme.${layerName}`);
    if (layerExists) {
      console.warn('Layer already exists on map');
      return;
    }

    const layerDef = getThemeLayerById(themeLayerConfig, layerName);

    if (!layerDef) {
      console.warn(`Layer definition not found for layer name: ${layerName}`);
      return;
    }

    const layerToAdd = createThemeLayerFromConfig(
      themeLayerConfig,
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

  themeLayersToRemove.forEach((layerName) => {
    const layer = map
      .getLayers()
      .getArray()
      .find((layer) => layer.get('id') === `theme.${layerName}`);
    if (layer) {
      map.removeLayer(layer);

      const store = getDefaultStore();
      const currentResult = store.get(featureInfoResultAtom);
      if (currentResult) {
        const remainingLayers = currentResult.layers.filter(
          (l) => l.layerId !== `theme.${layerName}`,
        );
        if (remainingLayers.length === 0) {
          store.set(featureInfoResultAtom, null);
          store.set(featureInfoPanelOpenAtom, false);
        } else if (remainingLayers.length !== currentResult.layers.length) {
          store.set(featureInfoResultAtom, {
            ...currentResult,
            layers: remainingLayers,
          });
        }
      }
    }
    removeFromUrlListParameter('themeLayers', layerName);
  });

  return;
});
