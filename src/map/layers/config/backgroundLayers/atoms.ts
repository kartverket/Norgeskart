import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { WMTSCapabilities } from 'ol/format';
import ImageTile from 'ol/ImageTile';
import TileLayer from 'ol/layer/Tile';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import Tile, { LoadFunction } from 'ol/Tile';
import { getEnv } from '../../../../env';
import { mapAtom } from '../../../atoms';
import { BackgroundLayerName } from '../../backgroundLayers';
import { KvCacheBackgroundLayers } from './kvCache';
import { nibBackgroundLayers } from './nib';
import { npolarBackgroundLayers } from './npolar';

const env = getEnv();
export const allConfiguredBackgroundLayers = [
  ...KvCacheBackgroundLayers,
  ...nibBackgroundLayers,
  ...npolarBackgroundLayers,
];

const nibTileLoadFunction: LoadFunction = (imageTile: Tile, src: string) => {
  const token = env.layerProviderParameters.norgeIBilder.apiKey;
  if (imageTile instanceof ImageTile) {
    const image = imageTile.getImage();
    if (image instanceof HTMLImageElement) {
      image.src = src + (src.includes('?') ? '&' : '?') + 'token=' + token;
    }
  }
};

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
      const capabilitiesResponse = await fetch(
        layerConfig.provider.capabilitiesUrl,
      );
      if (!capabilitiesResponse.ok) {
        throw new Error(
          `Failed to fetch capabilities for layer ${layerName}: ${capabilitiesResponse.statusText}`,
        );
      }
      const capabilitiesText = await capabilitiesResponse.text();
      const parser = new WMTSCapabilities();
      const capabilities = parser.read(capabilitiesText);
      const layerOptions = optionsFromCapabilities(capabilities, {
        layer: layerName,
      });

      if (!layerOptions) {
        throw new Error(`Layer ${layerName} not found in capabilities`);
      }

      const wmts = layerConfig.layerName.startsWith('Nibcache')
        ? new WMTS({
            ...layerOptions,
            tileLoadFunction: nibTileLoadFunction,
          })
        : new WMTS({ ...layerOptions });

      const store = getDefaultStore();
      const map = store.get(mapAtom);

      map.getLayers().forEach((layer) => {
        const layerId = layer.get('id');
        if (layerId && layerId.startsWith('bg.')) {
          map.removeLayer(layer);
        }
      });

      map.addLayer(
        new TileLayer({
          source: wmts,
          properties: { id: `bg.${layerName}` },
        }),
      );

      console.log(`Capabilities for layer ${layerName}:`, capabilitiesText);
    } catch (error) {
      console.error(
        `Error fetching capabilities for layer ${layerName}:`,
        error,
      );
    }
  };

  effect();
});
