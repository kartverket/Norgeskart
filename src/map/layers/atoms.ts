import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { ProjectionIdentifier } from '../../map/projections/types';
import {
  addToUrlListParameter,
  removeFromUrlListParameter,
} from '../../shared/utils/urlUtils';
import { mapAtom } from '../atoms';
import {
  featureInfoPanelOpenAtom,
  featureInfoResultAtom,
} from '../featureInfo/atoms';
import { backgroundLayerAtom } from './config/backgroundLayers/atoms';
import { getThemeLayerById, themeLayerConfig } from './themeLayerConfigApi';
import { createThemeLayerFromConfig, ThemeLayerName } from './themeWMS';

export const preNauticalProjectionAtom = atom<ProjectionIdentifier | null>(
  null,
);

const isSjoLayer = (layerName: ThemeLayerName): boolean => {
  const layerDef = themeLayerConfig.layers.find((l) => l.id === layerName);
  if (!layerDef) return false;
  const category = themeLayerConfig.categories.find(
    (c) => c.id === layerDef.categoryId,
  );
  return category?.id === 'sjo' || category?.parentId === 'sjo';
};

export const activeThemeLayersAtom = atom<Set<ThemeLayerName>>(new Set([]));

export const themeLayerEffect = atomEffect((get) => {
  const themeLayers = get(activeThemeLayersAtom);
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

  if (Array.from(themeLayers.entries()).find(([l, _]) => isSjoLayer(l))) {
    const currentBakground = store.get(backgroundLayerAtom);
    if (currentBakground !== 'nautical-background') {
      store.set(
        preNauticalProjectionAtom,
        store
          .get(mapAtom)
          .getView()
          .getProjection()
          .getCode() as ProjectionIdentifier,
      );
      store.set(backgroundLayerAtom, 'nautical-background');
    }
  }

  return;
});
