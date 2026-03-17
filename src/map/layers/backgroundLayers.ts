import { AvailableProjectionType } from '../atoms';
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

export const isLayerNiBLayer = (layerName: BackgroundLayerName) => {
  return layerName.startsWith('Nibcache_');
};

export const getNiBLayerNameForProjection = (
  projection: AvailableProjectionType,
): WMTSLayerName | null => {
  switch (projection) {
    case 'EPSG:4326':
      return null;
    case 'EPSG:3857':
      return 'Nibcache_web_mercator_v2';
    case 'EPSG:25832':
      return 'Nibcache_UTM32_EUREF89_v2';
    case 'EPSG:25833':
      return 'Nibcache_UTM33_EUREF89_v2';
    case 'EPSG:25835':
      return 'Nibcache_UTM35_EUREF89_v2';
    default:
      return null;
  }
};
