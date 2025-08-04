import { atom, useSetAtom } from 'jotai';
import { loadable } from 'jotai/utils';
import { WMTSCapabilities } from 'ol/format';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import { AvailableProjections, ProjectionIdentifier } from '../atoms';

export type WMTSLayerName =
  | 'topo'
  | 'topograatone'
  | 'sjokartraster'
  | 'topoProd'
  | 'Nibcache_web_mercator_v2'
  | 'Nibcache_UTM32_EUREF89_v2'
  | 'Nibcache_UTM33_EUREF89_v2'
  | 'Nibcache_UTM35_EUREF89_v2';

export type WMTSProviderId =
  | 'kartverketCache'
  | 'kartverketATKV3dev'
  | 'norgeibilder_webmercator'
  | 'norgeibilder_utm32'
  | 'norgeibilder_utm33'
  | 'norgeibilder_utm35';

type WMTSProvider = {
  baseUrl: string;
  endpoints: {
    getCapabilities: string;
  };
  layers: WMTSLayerName[];
};

type WMTSProviders = Record<WMTSProviderId, WMTSProvider>;

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
    layers: ['topo'],
  },
  norgeibilder_webmercator: {
    baseUrl: 'https://opencache.statkart.no',
    endpoints: {
      getCapabilities:
        '/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2?Request=GetCapabilities&Service=WMTS',
    },
    layers: ['Nibcache_web_mercator_v2'],
  },

  norgeibilder_utm32: {
    baseUrl: 'https://opencache.statkart.no',
    endpoints: {
      getCapabilities:
        '/gatekeeper/gk/gk.open_nib_utm32_wmts_v2?Request=GetCapabilities&Service=WMTS',
    },
    layers: ['Nibcache_UTM32_EUREF89_v2'],
  },

  norgeibilder_utm33: {
    baseUrl: 'https://opencache.statkart.no',
    endpoints: {
      getCapabilities:
        '/gatekeeper/gk/gk.open_nib_utm33_wmts_v2?Request=GetCapabilities&Service=WMTS',
    },
    layers: ['Nibcache_UTM33_EUREF89_v2'],
  },

  norgeibilder_utm35: {
    baseUrl: 'https://opencache.statkart.no',
    endpoints: {
      getCapabilities:
        '/gatekeeper/gk/gk.open_nib_utm35_wmts_v2?Request=GetCapabilities&Service=WMTS',
    },
    layers: ['Nibcache_UTM35_EUREF89_v2'],
  },
};
// To allow the strange matrix set identifiers in NorgeIBilder
const parseMatrixSetString = (identifier: string) => {
  const parsed = identifier.replace('::', ':').split('crs:')[1];
  return parsed ? parsed : identifier;
};

const isStringInSelectableProjection = (identifier: string) => {
  return AvailableProjections.includes(identifier as ProjectionIdentifier);
};

const WMTSAtom = atom(async (get) => {
  get(wmtsRefreshTriggerAtom);
  const parser = new WMTSCapabilities();

  const providerLayerMap: Map<
    WMTSProviderId,
    Map<ProjectionIdentifier, Map<WMTSLayerName, WMTS>>
  > = new Map();

  await Promise.all(
    Object.keys(providers).map(async (pid) => {
      const providerId = pid as WMTSProviderId;

      const provider = providers[providerId];
      const capabiltiesRes = await fetch(
        provider.baseUrl + provider.endpoints.getCapabilities,
      );
      const capabilitiesText = await capabiltiesRes.text();
      const providerCapabilities = parser.read(capabilitiesText);

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const availableMatrixSets: ProjectionIdentifier[] =
        providerCapabilities.Contents.TileMatrixSet.map(
          (m: any) => m.SupportedCRS,
        )
          .map(parseMatrixSetString)
          .filter(isStringInSelectableProjection);

      /* eslint-enable @typescript-eslint/no-explicit-any */
      const projectionLayerMapForProvider: Map<
        ProjectionIdentifier,
        Map<WMTSLayerName, WMTS>
      > = new Map();

      availableMatrixSets.forEach((prId) => {
        const layersForProjection: Map<WMTSLayerName, WMTS> = new Map();

        provider.layers.forEach((layer) => {
          const options = optionsFromCapabilities(providerCapabilities, {
            layer,
            projection: prId,
          });
          if (options != null) {
            layersForProjection.set(layer, new WMTS(options));
          }
        });
        projectionLayerMapForProvider.set(prId, layersForProjection);
      });

      providerLayerMap.set(providerId, projectionLayerMapForProvider);
    }),
  );

  return providerLayerMap;
});
const wmtsRefreshTriggerAtom = atom(0);
export const loadableWMTS = loadable(WMTSAtom);

export const useRefreshWMTS = () => {
  const refreshWMTS = useSetAtom(wmtsRefreshTriggerAtom);
  return () => {
    refreshWMTS((c) => c + 1);
  };
};
