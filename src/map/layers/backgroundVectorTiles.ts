import { MapLibreLayer } from '@geoblocks/ol-maplibre-layer';
import BaseLayer from 'ol/layer/Base';

export type VectorTileLayerName = 'nautical-background';

type VectorTileProvider = {
  name: VectorTileLayerName;
  styleUrl: string;
  description: string;
};

const vectorTileProviders: Record<VectorTileLayerName, VectorTileProvider> = {
  'nautical-background': {
    name: 'nautical-background',
    styleUrl: '/api/styles/nautisk-bakgrunnskart.json',
    description: 'Nautical background map with vector tiles',
  },
};

const layerCache = new Map<VectorTileLayerName, BaseLayer>();

export const createVectorTileLayer = async (
  layerName: VectorTileLayerName,
): Promise<BaseLayer | null> => {
  const cached = layerCache.get(layerName);
  if (cached) {
    return cached;
  }

  const provider = vectorTileProviders[layerName];
  if (!provider) {
    console.error(`Vector tile provider ${layerName} not found`);
    return null;
  }

  try {
    // Use MapLibre GL JS (WebGL) to render the Mapbox vector tile style.
    const layer = new MapLibreLayer({
      mapLibreOptions: {
        style: window.location.origin + provider.styleUrl,
      },
      properties: {
        id: `bg.${layerName}`,
        isVectorTile: true,
      },
    });

    layerCache.set(layerName, layer);
    return layer;
  } catch (error) {
    console.error(`Failed to load vector tile layer ${layerName}:`, error);
    return null;
  }
};

export const getAvailableVectorTileLayers = (): VectorTileLayerName[] => {
  return Object.keys(vectorTileProviders) as VectorTileLayerName[];
};

export const isVectorTileLayer = (
  layerName: string,
): layerName is VectorTileLayerName => {
  return layerName in vectorTileProviders;
};
