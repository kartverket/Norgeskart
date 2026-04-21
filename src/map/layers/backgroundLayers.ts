export type EmptyLayerName = 'empty';
export type WMSLayerName = 'oceanicelectronic' | 'sjokartraster';
export type VectorTileLayerName = 'nautical-background';
export type WMTSLayerName =
  | 'topo'
  | 'topograatone'
  | 'toporaster'
  | 'topoProd'
  | 'topo_test'
  | 'Nibcache_web_mercator_v2'
  | 'Nibcache_UTM32_EUREF89_v2'
  | 'Nibcache_UTM33_EUREF89_v2'
  | 'Nibcache_UTM35_EUREF89_v2'
  | 'Basisdata_NP_Basiskart_Svalbard_WMTS_25833'
  | 'Basisdata_NP_Basiskart_JanMayen_WMTS_25833';

export type BackgroundLayerName =
  | WMTSLayerName
  | WMSLayerName
  | VectorTileLayerName
  | EmptyLayerName;

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

export const isVectorTileLayer = (
  layerName: string,
): layerName is VectorTileLayerName => {
  return layerName === 'nautical-background';
};
