import MapLibreLayer from '@geoblocks/ol-maplibre-layer/lib/MapLibreLayer';
import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { Map } from 'ol';
import { WMTSCapabilities } from 'ol/format';
import ImageTile from 'ol/ImageTile';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import Tile, { LoadFunction } from 'ol/Tile';
import { getEnv } from '../../../../env';
import { mapAtom } from '../../../atoms';
import { BackgroundLayerName } from '../../backgroundLayers';
import { KvCacheBackgroundLayers } from './kvCache';
import { nauticalBackgroundLayers } from './nautical';
import { nibBackgroundLayers } from './nib';
import { npolarBackgroundLayers } from './npolar';
import {
  VectorTileBackgroundLayer,
  WMSBackgroundLayer,
  WMTSBackgroundLayer,
} from './types';

const env = getEnv();
export const allConfiguredBackgroundLayers = [
  ...KvCacheBackgroundLayers,
  ...nibBackgroundLayers,
  ...npolarBackgroundLayers,
  ...nauticalBackgroundLayers,
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

const clearBackgroundLayer = (map: Map) => {
  map.getLayers().forEach((layer) => {
    const layerId = layer.get('id');
    if (layerId && layerId.startsWith('bg.')) {
      map.removeLayer(layer);
    }
  });
};

const getWMTSLayer = async (layerConfig: WMTSBackgroundLayer) => {
  try {
    const capabilitiesResponse = await fetch(
      layerConfig.provider.capabilitiesUrl,
    );
    if (!capabilitiesResponse.ok) {
      throw new Error(
        `Failed to fetch capabilities for layer ${layerConfig.layerName}: ${capabilitiesResponse.statusText}`,
      );
    }
    const capabilitiesText = await capabilitiesResponse.text();
    const parser = new WMTSCapabilities();
    const capabilities = parser.read(capabilitiesText);
    const layerOptions = optionsFromCapabilities(capabilities, {
      layer: layerConfig.layerName,
    });

    if (!layerOptions) {
      throw new Error(
        `Layer ${layerConfig.layerName} not found in capabilities`,
      );
    }

    const wmts = layerConfig.layerName.startsWith('Nibcache')
      ? new WMTS({
          ...layerOptions,
          tileLoadFunction: nibTileLoadFunction,
        })
      : new WMTS({ ...layerOptions });

    const layer = new TileLayer({
      source: wmts,
      properties: { id: `bg.${layerConfig.layerName}` },
    });
    return layer;
  } catch (error) {
    console.error(
      `Error fetching capabilities for layer ${layerConfig.layerName}:`,
      error,
    );
  }
};

const getVectorTileLayer = (layerConfig: VectorTileBackgroundLayer) => {
  const layer = new MapLibreLayer({
    mapLibreOptions: {
      style: layerConfig.styleUrl,
    },
    properties: {
      id: `bg.${layerConfig.layerName}`,
      isVectorTile: true,
    },
  });
  return layer;
};

const getWMSLayer = (layerConfig: WMSBackgroundLayer) => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const projection = map.getView().getProjection().getCode();
  const layer = new TileLayer({
    source: new TileWMS({
      url: layerConfig.url,
      params: { ...layerConfig.props, SRS: projection },
    }),
    properties: { id: `bg.${layerConfig.layerName}` },
  });

  return layer;
};

export const backgroundLayerAtom_v2_effect = atomEffect((get) => {
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
        clearBackgroundLayer(map);
        map.addLayer(layer);
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
