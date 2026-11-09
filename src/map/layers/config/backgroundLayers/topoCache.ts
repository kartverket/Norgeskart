import { getEnv } from '../../../../env';
import { BackgroundLayer, LayerProvider } from './types';

const { baseUrl, layers } = getEnv().layerProviderParameters.topoCache;

const TopoCacheProvider: LayerProvider = {
  capabilitiesUrl: baseUrl + '/service?SERVICE=WMTS&REQUEST=GetCapabilities',
};

// New Norgeskart Standard background (rGIS + MapProxy), offered next to the old
// cache.kartverket.no 'topo' and flagged "New" in the picker (see newBackgroundLayers).
// No legend yet: /legend/topo-{scale}.png is a label-less 29 px strip, same at every scale.
export const topoCacheBackgroundLayers: BackgroundLayer[] = [
  {
    type: 'WMTS',
    layerName: 'norgeskart_standard',
    wmtsLayerName: layers.standard,
    provider: TopoCacheProvider,
    hidpi: {
      wmtsLayerName: layers.standard2x,
      // utm32n/utm35n twins: unadvertised ones fall back to 1x.
      matrixSets: {
        norway_25833: 'norway_25833_2x',
        utm32n: 'utm32n_2x',
        utm35n: 'utm35n_2x',
      },
    },
  },
];
