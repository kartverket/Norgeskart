import { getEnv } from '../../../../env';
import { BackgroundLayer, LayerProvider } from './types';

const env = getEnv();

const TopoCacheProvider: LayerProvider = {
  capabilitiesUrl:
    env.layerProviderParameters.topoCache.baseUrl +
    '/wmts/1.0.0/WMTSCapabilities.xml',
};

export const topoCacheBackgroundLayers: BackgroundLayer[] = [
  { type: 'WMTS', layerName: 'topo_test', wmtsLayerName: 'topo', provider: TopoCacheProvider },
];
