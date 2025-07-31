import { atom } from 'jotai';
import { loadable } from 'jotai/utils';
import { WMTSCapabilities } from 'ol/format';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import { mapAtom } from '../atoms';

export type WMTSLayerName =
  | 'topo'
  | 'topograatone'
  | 'sjokartraster'
  | 'topoProd';

export type WMTSProviderId = 'kartverketCache' | 'kartverketATKV3dev';

type WMTSProvider = {
  baseUrl: string;
  endpoints: {
    getCapabilities: string;
  };
  layers: WMTSLayerName[];
};

type WMTSProviders = Record<WMTSProviderId, WMTSProvider>;

export type WMTSLayerID = `${WMTSProviderId}_${WMTSLayerName}`;

const providers: WMTSProviders = {
  kartverketCache: {
    baseUrl: 'https://cache.kartverket.no',
    endpoints: {
      getCapabilities: '/v1/service?Request=GetCapabilities&Service=WMTS',
    },
    layers: ['topo', 'topograatone', 'sjokartraster'],
  },
  kartverketATKV3dev: {
    baseUrl: 'https://cache.atkv3-dev.kartverket.cloud',
    endpoints: {
      getCapabilities: '/v1/service?Request=GetCapabilities&Service=WMTS',
    },
    layers: ['topoProd', 'topo'],
  },
};

const WMTSAtom = atom(async (get) => {
  const parser = new WMTSCapabilities();
  const projection = get(mapAtom).getView().getProjection();

  let layerOptMap: Map<WMTSLayerID, WMTS | null> = new Map();

  await Promise.all(
    Object.keys(providers).map(async (pid) => {
      const providerId = pid as WMTSProviderId;

      const provider = providers[providerId];
      const capabiltiesRes = await fetch(
        provider.baseUrl + provider.endpoints.getCapabilities,
      );
      const capabilitiesText = await capabiltiesRes.text();
      const providerCapabilities = parser.read(capabilitiesText);
      provider.layers.forEach((layer) => {
        const options = optionsFromCapabilities(providerCapabilities, {
          layer,
          projection,
        });
        if (options != null) {
          layerOptMap.set(`${providerId}_${layer}`, new WMTS(options));
        }
      });
    }),
  );
  return layerOptMap;
});

export const loadableWMTS = loadable(WMTSAtom);
