import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import {
  getUrlParameter,
  setUrlParameter,
} from '../../../../shared/utils/urlUtils';
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

const getInitialBackgroundLayer = () => {
  const layerNameFromUrl = getUrlParameter('backgroundLayer');
  const finalLayerName = (layerNameFromUrl || 'topo') as BackgroundLayerName;
  return finalLayerName;
};

export const backgroundLayerAtom = atom<BackgroundLayerName>(
  getInitialBackgroundLayer(),
);

export const backgroundLayerAtomEffect = atomEffect((get, set) => {
  const layerName = get(backgroundLayerAtom);
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
        setUrlParameter('backgroundLayer', layerName);
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
