import { getEnv } from '../../../../env';
import { BackgroundLayer } from './types';

const env = getEnv();

export const nauticalBackgroundLayers: BackgroundLayer[] = [
  {
    type: 'VectorTile',
    layerName: 'nautical-background',
    requiredProjection: 'EPSG:3857',
    styleUrl: window.location.origin + '/api/styles/nautisk-bakgrunnskart.json',
  },
  {
    type: 'WMS',
    layerName: 'sjokartraster',
    url: env.layerProviderParameters.geoNorgeWMS.baseUrl + '.sjokartraster2',
    props: { LAYERS: 'all', TILED: true, VERSION: '1.3.0' },
  },
  {
    type: 'WMS',
    layerName: 'oceanicelectronic',
    url: window.location.origin + '/api/proxy/ecc-enc',
    props: { LAYERS: 'cells', TILED: true, VERSION: '1.1.0' },
  },
];
