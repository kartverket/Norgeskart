import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS';
import { AvailableProjectionType } from '../atoms';
import { ProjectionIdentifier } from '../projections/types';
import { VectorTileLayerName } from './backgroundVectorTiles';
import { getWMSLayer, WMSLayerName } from './backgroundWMS';
import { WMTSLayerName, WMTSProviderId } from './backgroundWMTSProviders';

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

const isLayerNiBLayer = (layerName: BackgroundLayerName) => {
  return layerName.startsWith('Nibcache_');
};

const getNiBLayerNameForProjection = (
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

type WMTSData = Map<
  WMTSProviderId,
  Map<ProjectionIdentifier, Map<WMTSLayerName, WMTS>>
>;

export const getBackgroundLayerForProjection = (
  wmtsData: WMTSData,
  projectionId: ProjectionIdentifier,
  layerName: BackgroundLayerName,
): TileLayer | null => {
  const wmsLayer = getWMSLayer(layerName as WMSLayerName, projectionId);
  if (wmsLayer) return wmsLayer;

  let targetLayerName: WMTSLayerName | null;
  if (isLayerNiBLayer(layerName)) {
    targetLayerName = getNiBLayerNameForProjection(
      projectionId as AvailableProjectionType,
    );
    if (!targetLayerName) {
      console.warn(
        `NiB layer ${layerName} is not available for projection ${projectionId}`,
      );
      return null;
    }
  } else {
    targetLayerName = layerName as WMTSLayerName;
  }

  for (const projectionLayerMap of wmtsData.values()) {
    const source = projectionLayerMap.get(projectionId)?.get(targetLayerName);
    if (source) {
      return new TileLayer({
        source,
        preload: Infinity,
        properties: { id: `bg.${targetLayerName}` },
      });
    }
  }

  return null;
};
