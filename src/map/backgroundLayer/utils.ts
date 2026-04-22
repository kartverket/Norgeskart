import { BackgroundLayerName } from '../layers/backgroundLayers';
import { allConfiguredBackgroundLayers } from '../layers/config/backgroundLayers/atoms';
import { ProjectionIdentifier } from '../projections/types';

const backgroundLayerOrder = new Map<BackgroundLayerName, number>([
  ['topo', 1],
  ['topograatone', 2],
  ['toporaster', 3],
  ['sjokartraster', 4],
  ['nautical-background', 5],
  ['Nibcache_web_mercator_v2', 6],
  ['Nibcache_UTM32_EUREF89_v2', 7],
  ['Nibcache_UTM33_EUREF89_v2', 8],
  ['Nibcache_UTM35_EUREF89_v2', 9],
  ['Basisdata_NP_Basiskart_Svalbard_WMTS_25833', 10],
  ['Basisdata_NP_Basiskart_JanMayen_WMTS_25833', 11],
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
