import { getEnv } from '../../../../env';
import { BackgroundLayer, LayerProvider } from './types';

const env = getEnv();
const layers = env.layerProviderParameters.topoCache.layers;
const np = layers.np;

// Only the atgcp1-dev MapProxy serves Topo forenklet (kart.api has no such layer),
// so it comes from there in every environment. Public host, so previews can reach it.
export const TOPO_FORENKLET_BASE_URL =
  'https://kart.atgcp1-dev.kartverket.cloud';

const TopoForenkletProvider: LayerProvider = {
  capabilitiesUrl:
    TOPO_FORENKLET_BASE_URL + '/service?SERVICE=WMTS&REQUEST=GetCapabilities',
};

const TopoCacheProvider: LayerProvider = {
  capabilitiesUrl:
    env.layerProviderParameters.topoCache.baseUrl +
    '/service?SERVICE=WMTS&REQUEST=GetCapabilities',
};

export const topoCacheBackgroundLayers: BackgroundLayer[] = [
  {
    type: 'WMTS',
    layerName: 'topo_forenklet',
    provider: TopoForenkletProvider,
  },
  {
    type: 'WMTS',
    layerName: 'norgeskart_standard',
    wmtsLayerName: layers.standard,
    provider: TopoCacheProvider,
    // NP grid only above norway_25833's top (north of Svalbard); norway_25833 (seeded, = prod)
    // below. The service's NP grid ends at the same line.
    projectionLayers: np && {
      'EPSG:25833': {
        wmtsLayerName: np.standard,
        hidpiWmtsLayerName: np.standard2x,
        mode: 'above',
      },
    },
    hidpi: {
      wmtsLayerName: layers.standard2x,
      // utm32n/utm35n twins: only atgcp1-dev so far; unadvertised ones fall back to 1x.
      matrixSets: {
        norway_25833: 'norway_25833_2x',
        norway_25833_np: 'norway_25833_np_2x',
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
    projectionLayers: np && {
      'EPSG:25833': { wmtsLayerName: np.gray, mode: 'above' },
    },
  },
];
