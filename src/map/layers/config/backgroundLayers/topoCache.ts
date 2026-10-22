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
      matrixSet: 'norway_25833',
      hidpiMatrixSet: 'norway_25833_2x',
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
];
