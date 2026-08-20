import { getEnv } from '../../../../env';
import { BackgroundLayer, LayerProvider } from './types';

const env = getEnv();

const TopoCacheProvider: LayerProvider = {
  capabilitiesUrl:
    env.layerProviderParameters.topoCache.baseUrl +
    '/service?SERVICE=WMTS&REQUEST=GetCapabilities',
};

export const topoCacheBackgroundLayers: BackgroundLayer[] = [
  {
    type: 'WMTS',
    layerName: 'norgeskart_standard',
    wmtsLayerName: 'norgeskart_standard',
    provider: TopoCacheProvider,
    legendUrl:
      env.layerProviderParameters.topoCache.baseUrl +
      '/legend/topo-{scale}.png',
  },
];
