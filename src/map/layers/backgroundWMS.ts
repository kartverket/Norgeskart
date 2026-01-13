import TileLayer from 'ol/layer/Tile';
import { TileWMS } from 'ol/source';
import { getEnv } from '../../env';

export type WMSLayerName = 'oceanicelectronic' | 'topo_2025';
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
          params: {
            LAYERS: 'cells',
            TILED: true,
            SRS: projection,
            TICKET: 'B8LBG7B',
          },
          projection: projection,
        }),
        properties: {
          id: 'bg.oceanicelectronic',
        },
      });
    case 'topo_2025':
      if (!ENV.layerProviderParameters.kartverketTopoWMS) {
        return null;
      }
      return new TileLayer({
        source: new TileWMS({
          url: ENV.layerProviderParameters.kartverketTopoWMS.baseUrl,
          params: {
            LAYERS: 'Topo',
            TILED: true,
            SRS: projection,
          },
          projection: projection,
        }),
        properties: {
          id: 'bg.topo_2025',
        },
      });
    default:
      return null;
  }
};
