import TileLayer from 'ol/layer/Tile';
import { TileWMS } from 'ol/source';
import { getEnv } from '../../env';

export type WMSLayerName = 'oceanicelectronic';
const ENV = getEnv();
export const getWMSLayer = (
  layerName: WMSLayerName,
  projection: string,
): TileLayer | null => {
  switch (layerName) {
    case 'oceanicelectronic':
      return new TileLayer({
        source: new TileWMS({
          url: ENV.layerProviderParameters.geoNorgeWMS.baseUrl + '.ecc_enc',
          params: { LAYERS: 'cells', TILED: true, SRS: projection },
          projection: projection,
        }),
        properties: {
          id: 'bg.oceanicelectronic',
        },
      });
    default:
      return null;
  }
};
