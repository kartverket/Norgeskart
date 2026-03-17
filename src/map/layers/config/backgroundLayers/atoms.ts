import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { currentProjectionAtom, mapAtom } from '../../../atoms';
import { BackgroundLayerName } from '../../backgroundLayers';
import { KvCacheBackgroundLayers } from './kvCache';
import { nauticalBackgroundLayers } from './nautical';
import { nibBackgroundLayers } from './nib';
import { npolarBackgroundLayers } from './npolar';
import {
  clearBackgroundLayer,
  getVectorTileLayer,
  getWMSLayer,
  getWMTSLayer,
} from './utils';

export const allConfiguredBackgroundLayers = [
  ...KvCacheBackgroundLayers,
  ...nibBackgroundLayers,
  ...npolarBackgroundLayers,
  ...nauticalBackgroundLayers,
];

export const backgroundLayerAtom_v2 = atom<BackgroundLayerName>('topo');

export const backgroundLayerAtom_v2_effect = atomEffect((get, set) => {
  const layerName = get(backgroundLayerAtom_v2);
  const layerConfig = allConfiguredBackgroundLayers.find(
    (layer) => layer.layerName === layerName,
  );

  if (!layerConfig) {
    console.warn(`No layer config found for layer name: ${layerName}`);
    return;
  }

  const effect = async () => {
    try {
      let layer = null;
      if (layerConfig.type === 'WMTS') {
        layer = await getWMTSLayer(layerConfig);
      }
      if (layerConfig.type === 'VectorTile') {
        layer = getVectorTileLayer(layerConfig);
      }

      if (layerConfig.type === 'WMS') {
        layer = getWMSLayer(layerConfig);
      }
      if (layer) {
        const store = getDefaultStore();
        const map = store.get(mapAtom);
        const currentProjection = map.getView().getProjection().getCode();
        clearBackgroundLayer();
        map.addLayer(layer);
        if (
          layerConfig.requiredProjection &&
          layerConfig.requiredProjection !== currentProjection
        ) {
          set(currentProjectionAtom, layerConfig.requiredProjection);
        }
      }
    } catch (error) {
      console.error(
        `Error fetching capabilities for layer ${layerName}:`,
        error,
      );
    }
  };

  effect();
});
