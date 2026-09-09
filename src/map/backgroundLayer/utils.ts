import { BackgroundLayerName } from '../layers/backgroundLayers';
import { allConfiguredBackgroundLayers } from '../layers/config/backgroundLayers/atoms';
import { ProjectionIdentifier } from '../projections/types';

const backgroundLayerOrder = new Map<BackgroundLayerName, number>([
  ['norgeskart_standard', 1],
  ['norgeskart_gray', 2],
  ['topo-vector', 3],
  ['toporaster', 4],
  ['sjokartraster', 5],
  ['nautical-background', 6],
  ['oceanicelectronic', 7],
  ['Nibcache_web_mercator_v2', 8],
  ['Nibcache_UTM32_EUREF89_v2', 9],
  ['Nibcache_UTM33_EUREF89_v2', 10],
  ['Nibcache_UTM35_EUREF89_v2', 11],
  ['Basisdata_NP_Basiskart_Svalbard_WMTS_25833', 12],
  ['Basisdata_NP_Basiskart_JanMayen_WMTS_25833', 13],
]);

const sortBackgroundLayers = (
  a: BackgroundLayerName,
  b: BackgroundLayerName,
) => {
  const priorityA = backgroundLayerOrder.get(a) ?? Number.MAX_SAFE_INTEGER;
  const priorityB = backgroundLayerOrder.get(b) ?? Number.MAX_SAFE_INTEGER;
  if (priorityA !== priorityB) return priorityA - priorityB;
  return a.localeCompare(b);
};

export const getAvailableBackgroundLayers = (
  currentProjection: ProjectionIdentifier,
) =>
  allConfiguredBackgroundLayers
    .filter(
      (layer) =>
        layer.showForProjections == null ||
        layer.showForProjections.includes(currentProjection),
    )
    .map((layer) => layer.layerName)
    .sort(sortBackgroundLayers);
