import MapLibreLayer from '@geoblocks/ol-maplibre-layer/lib/MapLibreLayer';
import { getDefaultStore } from 'jotai';
import { WMTSCapabilities } from 'ol/format';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import { mapAtom } from '../../../atoms';
import { nibTileLoadFunction } from './loadFunctions';
import {
  BackgroundLayer,
  VectorTileBackgroundLayer,
  WMSBackgroundLayer,
  WMTSBackgroundLayer,
} from './types';

export const getWMTSLayer = async (layerConfig: WMTSBackgroundLayer) => {
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
    return null;
  }
};

export const getVectorTileLayer = (layerConfig: VectorTileBackgroundLayer) => {
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

export const getWMSLayer = (layerConfig: WMSBackgroundLayer) => {
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

export const getLayerFromConfig = async (
  layerConfig: BackgroundLayer,
): Promise<TileLayer | MapLibreLayer | null> => {
  if (layerConfig.type === 'WMTS') {
    return await getWMTSLayer(layerConfig);
  }
  if (layerConfig.type === 'VectorTile') {
    return getVectorTileLayer(layerConfig);
  }
  if (layerConfig.type === 'WMS') {
    return getWMSLayer(layerConfig);
  }
  console.warn(`Unsupported layer type for layerconfig: ${layerConfig}`);
  return null;
};

export const clearBackgroundLayer = () => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  map.getLayers().forEach((layer) => {
    try {
      const layerId = layer.get('id');
      if (layerId && layerId.startsWith('bg.')) {
        map.removeLayer(layer);
      }
    } catch (error) {
      console.error('Error while clearing background layers:', error);
    }
  });
};
