import TileLayer from 'ol/layer/Tile';
import { TileWMS } from 'ol/source';

export type WMSLayerName = 'oceanicelectronic';

export const getWMSLayer = (
  layerName: WMSLayerName,
  projection: string,
): TileLayer | null => {
  switch (layerName) {
    case 'oceanicelectronic':
      return new TileLayer({
        source: new TileWMS({
          url: 'https://wms.geonorge.no/skwms1/wms.ecc_enc',
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
