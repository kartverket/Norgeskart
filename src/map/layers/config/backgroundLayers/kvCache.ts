import { getEnv } from '../../../../env';
import { BackgroundLayer, LayerProvider } from './types';

const env = getEnv();

const KvCacheProvider: LayerProvider = {
  capabilitiesUrl:
    env.layerProviderParameters.kartverketCache.baseUrl +
    '/v1/service?Request=GetCapabilities&Service=WMTS',
};

export const KvCacheBackgroundLayers: BackgroundLayer[] = [
  { type: 'WMTS', layerName: 'topo', provider: KvCacheProvider },
  { type: 'WMTS', layerName: 'topograatone', provider: KvCacheProvider },
  { type: 'WMTS', layerName: 'toporaster', provider: KvCacheProvider },
  { type: 'WMTS', layerName: 'sjokartraster', provider: KvCacheProvider },
];
