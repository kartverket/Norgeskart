import { atom } from 'jotai';
import { loadable } from 'jotai/utils';
import { ImageTile } from 'ol';
import { WMTSCapabilities } from 'ol/format';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import Tile, { LoadFunction } from 'ol/Tile';
import { getEnv } from '../../env';
import { AvailableProjections, ProjectionIdentifier } from '../atoms';

export const DEFAULT_BACKGROUND_LAYER = 'topo';

export type WMTSLayerName =
  | 'topo'
  | 'topograatone'
  | 'toporaster'
  | 'sjokartraster'
  | 'topoProd'
  | 'Nibcache_web_mercator_v2'
  | 'Nibcache_UTM32_EUREF89_v2'
  | 'Nibcache_UTM33_EUREF89_v2'
  | 'Nibcache_UTM35_EUREF89_v2';

export type WMTSProviderId =
  | 'kartverketCache'
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

const isNorgeIBilderLayer = (layer: WMTSLayerName) => {
  return (
    layer === 'Nibcache_web_mercator_v2' ||
    layer === 'Nibcache_UTM32_EUREF89_v2' ||
    layer === 'Nibcache_UTM33_EUREF89_v2' ||
    layer === 'Nibcache_UTM35_EUREF89_v2'
  );
};

type WMTSProviders = Record<WMTSProviderId, WMTSProvider>;
const ENV = getEnv();
const providers: WMTSProviders = {
  kartverketCache: {
    baseUrl: ENV.layerProviderParameters.kartverketCache.baseUrl,
    endpoints: {
      getCapabilities: '/v1/service?Request=GetCapabilities&Service=WMTS',
    },
    layers: ['topo', 'topograatone', 'toporaster', 'sjokartraster'],
  },
  norgeibilder_webmercator: {
    baseUrl: ENV.layerProviderParameters.norgeIBilder.baseUrl,
    endpoints: {
      getCapabilities:
        '/arcgis/rest/services/Nibcache_web_mercator_v2/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?token=' +
        ENV.layerProviderParameters.norgeIBilder.apiKey,
    },
    layers: ['Nibcache_web_mercator_v2'],
  },
  norgeibilder_utm32: {
    baseUrl: ENV.layerProviderParameters.norgeIBilder.baseUrl,
    endpoints: {
      getCapabilities:
        '/arcgis/rest/services/Nibcache_UTM32_EUREF89_v2/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?token=' +
        ENV.layerProviderParameters.norgeIBilder.apiKey,
    },
    layers: ['Nibcache_UTM32_EUREF89_v2'],
  },
  norgeibilder_utm33: {
    baseUrl: ENV.layerProviderParameters.norgeIBilder.baseUrl,
    endpoints: {
      getCapabilities:
        '/arcgis/rest/services/Nibcache_UTM33_EUREF89_v2/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?token=' +
        ENV.layerProviderParameters.norgeIBilder.apiKey,
    },
    layers: ['Nibcache_UTM33_EUREF89_v2'],
  },
  norgeibilder_utm35: {
    baseUrl: ENV.layerProviderParameters.norgeIBilder.baseUrl,
    endpoints: {
      getCapabilities:
        '/arcgis/rest/services/Nibcache_UTM35_EUREF89_v2/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?token=' +
        ENV.layerProviderParameters.norgeIBilder.apiKey,
    },
    layers: ['Nibcache_UTM35_EUREF89_v2'],
  },
};

const nibTileLoadFunction: LoadFunction = (imageTile: Tile, src: string) => {
  const token = ENV.layerProviderParameters.norgeIBilder.apiKey;
  if (imageTile instanceof ImageTile) {
    const image = imageTile.getImage();
    if (image instanceof HTMLImageElement) {
      image.src = src + (src.includes('?') ? '&' : '?') + 'token=' + token;
    }
  }
};

// To allow the strange matrix set identifiers in NorgeIBilder
const parseMatrixSetString = (identifier: string) => {
  const parsed = identifier.replace('::', ':').split('crs:')[1];
  return parsed ? parsed : identifier;
};

const isStringInSelectableProjection = (identifier: string) => {
  return AvailableProjections.includes(identifier as ProjectionIdentifier);
};

const WMTSAtom = atom(async () => {
  const parser = new WMTSCapabilities();

  const providerLayerMap: Map<
    WMTSProviderId,
    Map<ProjectionIdentifier, Map<WMTSLayerName, WMTS>>
  > = new Map();

  await Promise.all(
    Object.keys(providers).map(async (pid) => {
      const providerId = pid as WMTSProviderId;
      const provider = providers[providerId];
      try {
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
              const wmts = isNorgeIBilderLayer(layer)
                ? new WMTS({
                    ...options,
                    tileLoadFunction: nibTileLoadFunction,
                  })
                : new WMTS({ ...options });
              layersForProjection.set(layer, wmts);
            }
          });
          projectionLayerMapForProvider.set(prId, layersForProjection);
        });

        providerLayerMap.set(providerId, projectionLayerMapForProvider);
      } catch (error) {
        console.error(
          `Failed to load WMTS capabilities for ${providerId}:`,
          error,
        );
      }
    }),
  );

  return providerLayerMap;
});
export const loadableWMTS = loadable(WMTSAtom);
