export const DEFAULT_BACKGROUND_LAYER = 'topo';

export type WMTSLayerName =
  | 'topo'
  | 'topograatone'
  | 'toporaster'
  | 'sjokartraster'
  | 'topoProd'
  | 'Nibcache_web_mercator_v2'
  | 'Nibcache_UTM32_EUREF89_v2'
  | 'Nibcache_UTM33_EUREF89_v2'
  | 'Nibcache_UTM35_EUREF89_v2'
  | 'Basisdata_NP_Basiskart_Svalbard_WMTS_25833'
  | 'Basisdata_NP_Basiskart_JanMayen_WMTS_25833';

export type WMTSProviderId =
  | 'kartverketCache'
  | 'norgeibilder_webmercator'
  | 'norgeibilder_utm32'
  | 'norgeibilder_utm33'
  | 'norgeibilder_utm35'
  | 'npolar_svalbard'
  | 'npolar_jan_mayen';
