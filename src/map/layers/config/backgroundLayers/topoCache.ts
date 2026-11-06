import { getEnv } from '../../../../env';
import { BackgroundLayer, LayerProvider } from './types';

const env = getEnv();
const layers = env.layerProviderParameters.topoCache.layers;

const TopoCacheProvider: LayerProvider = {
  capabilitiesUrl:
    env.layerProviderParameters.topoCache.baseUrl +
    '/service?SERVICE=WMTS&REQUEST=GetCapabilities',
};

export const topoCacheBackgroundLayers: BackgroundLayer[] = [
  {
    type: 'WMTS',
    layerName: 'norgeskart_standard',
    wmtsLayerName: layers.standard,
    provider: TopoCacheProvider,
    hidpi: {
      wmtsLayerName: layers.standard2x,
      // utm32n/utm35n twins: only atgcp1-dev so far; unadvertised ones fall back to 1x.
      matrixSets: {
        norway_25833: 'norway_25833_2x',
        utm32n: 'utm32n_2x',
        utm35n: 'utm35n_2x',
      },
    },
    legendUrl:
      env.layerProviderParameters.topoCache.baseUrl +
      '/legend/topo-{scale}.png',
  },
  {
    type: 'WMTS',
    layerName: 'norgeskart_gray',
    wmtsLayerName: layers.gray,
    provider: TopoCacheProvider,
  },
  // No hidpi twin yet: MapProxy only has 2x for topo_cache, so 2x screens get upscaled 256 px.
  ...(layers.forenklet
    ? [
        {
          type: 'WMTS' as const,
          layerName: 'norgeskart_forenklet' as const,
          wmtsLayerName: layers.forenklet,
          provider: TopoCacheProvider,
          legendUrl:
            env.layerProviderParameters.topoCache.baseUrl +
            '/legend/topo-{scale}.png',
        },
      ]
    : []),
];
