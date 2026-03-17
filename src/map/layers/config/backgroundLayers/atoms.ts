import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import {
  getUrlParameter,
  setUrlParameter,
} from '../../../../shared/utils/urlUtils';
import { currentProjectionAtom, mapAtom } from '../../../atoms';
import {
  BackgroundLayerName,
  mapLegacyBackgroundLayerId,
} from '../../backgroundLayers';
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

const getDefaultBackgroundLayer = () => {
  let layerNameFromUrl = getUrlParameter('backgroundLayer');
  const legacyLayerParam = getUrlParameter('layers');
  let legacyThemeLayerIds: string[] = [];

  if (legacyLayerParam) {
    const layerIds = legacyLayerParam
      .split(',')
      .map((s) => s.trim())
      .filter((id) => id.length > 0);

    const backgroundLayerId = layerIds.find(
      (id) => mapLegacyBackgroundLayerId(id) !== null,
    );

    const themeLayerIds = layerIds.filter(
      (id) => id !== backgroundLayerId && parseInt(id, 10) > 1010,
    );

    if (backgroundLayerId) {
      layerNameFromUrl = backgroundLayerId;
    }
    legacyThemeLayerIds = themeLayerIds;
  }

  if (layerNameFromUrl) {
    const legacyLayerName = mapLegacyBackgroundLayerId(layerNameFromUrl);
    if (legacyLayerName) {
      layerNameFromUrl = legacyLayerName;
    }
  }
  const finalLayerName = (layerNameFromUrl || 'topo') as BackgroundLayerName;
  return finalLayerName;
};

export const backgroundLayerAtom_v2 = atom<BackgroundLayerName>(
  getDefaultBackgroundLayer(),
);

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
