import { BackgroundLayerName } from '../layers/backgroundLayers';
import { allConfiguredBackgroundLayers } from '../layers/config/backgroundLayers/atoms';
import { ProjectionIdentifier } from '../projections/types';

const backgroundLayerOrder = new Map<BackgroundLayerName, number>([
  ['topo', 1],
  ['norgeskart_standard', 2],
  ['topograatone', 3],
  ['norgeskart_gray', 4],
  ['toporaster', 5],
  ['sjokartraster', 6],
  ['nautical-background', 7],
  ['oceanicelectronic', 8],
  ['Nibcache_web_mercator_v2', 9],
  ['Nibcache_UTM32_EUREF89_v2', 10],
  ['Nibcache_UTM33_EUREF89_v2', 11],
  ['Nibcache_UTM35_EUREF89_v2', 12],
]);

// Not offered in the picker; still configured so old ?backgroundLayer= links keep working.
const hiddenBackgroundLayers: ReadonlySet<BackgroundLayerName> = new Set([
  'Basisdata_NP_Basiskart_Svalbard_WMTS_25833',
  'Basisdata_NP_Basiskart_JanMayen_WMTS_25833',
]);

// Shown with a "New" badge in the background layer picker.
export const newBackgroundLayers: ReadonlySet<BackgroundLayerName> = new Set([
  'norgeskart_standard',
  'norgeskart_gray',
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
        !hiddenBackgroundLayers.has(layer.layerName) &&
        (layer.showForProjections == null ||
          layer.showForProjections.includes(currentProjection)),
    )
    .map((layer) => layer.layerName)
    .sort(sortBackgroundLayers);
