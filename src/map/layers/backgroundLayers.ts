export type WMSLayerName = 'oceanicelectronic' | 'sjokartraster';
export type VectorTileLayerName = 'nautical-background';
export type EmptyLayerName = 'empty';
export type WMTSLayerName =
  | 'toporaster'
  | 'topoProd'
  | 'norgeskart_standard'
  | 'norgeskart_gray'
  | 'Nibcache_web_mercator_v2'
  | 'Nibcache_UTM32_EUREF89_v2'
  | 'Nibcache_UTM33_EUREF89_v2'
  | 'Nibcache_UTM35_EUREF89_v2'
  | 'Basisdata_NP_Basiskart_Svalbard_WMTS_25833'
  | 'Basisdata_NP_Basiskart_JanMayen_WMTS_25833';

export type BackgroundLayerName =
  WMTSLayerName | WMSLayerName | VectorTileLayerName | EmptyLayerName;

export const mapLegacyBackgroundLayerId = (
  layerId: string,
): BackgroundLayerName | null => {
  const legacyIdMap: Record<string, BackgroundLayerName> = {
    // background layer names before the switch to kart.api.kartverket.no
    topo: 'norgeskart_standard',
    topograatone: 'norgeskart_gray',
    '1001': 'norgeskart_standard',
    '1003': 'norgeskart_gray',
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
