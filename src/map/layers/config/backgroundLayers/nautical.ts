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
    layerName: 'oceanicelectronic',
    url: env.layerProviderParameters.geoNorgeWMS.baseUrl + '.ecc_enc',
    props: { LAYERS: 'cells', TILED: true, VERSION: '1.1.0' },
  },
];
