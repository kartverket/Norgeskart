import { getEnv } from '../../../../env';
import { BackgroundLayer, LayerProvider } from './types';

const env = getEnv();

const KvCacheProvider: LayerProvider = {
  capabilitiesUrl:
    env.layerProviderParameters.kartverketCache.baseUrl +
    '/v1/service?Request=GetCapabilities&Service=WMTS',
};

export const KvCacheBackgroundLayers: BackgroundLayer[] = [
  { layerName: 'topo', provider: KvCacheProvider },
  { layerName: 'topograatone', provider: KvCacheProvider },
  { layerName: 'toporaster', provider: KvCacheProvider },
  { layerName: 'sjokartraster', provider: KvCacheProvider },
];
