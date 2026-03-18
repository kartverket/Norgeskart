import { VectorTileLayerName } from './backgroundVectorTiles';
import { WMSLayerName } from './backgroundWMS';
import { WMTSLayerName } from './backgroundWMTSProviders';

export type BackgroundLayerName =
  | WMTSLayerName
  | WMSLayerName
  | VectorTileLayerName;

export const mapLegacyBackgroundLayerId = (
  layerId: string,
): BackgroundLayerName | null => {
  const legacyIdMap: Record<string, BackgroundLayerName> = {
    '1001': 'topo',
    '1003': 'topograatone',
    '1004': 'toporaster',
    '1002': 'Nibcache_UTM33_EUREF89_v2',
    '1009': 'oceanicelectronic',
    '10088': 'sjokartraster',
  };

  return legacyIdMap[layerId] || null;
};
