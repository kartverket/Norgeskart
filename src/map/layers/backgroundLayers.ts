import { useAtomValue } from 'jotai';
import TileLayer from 'ol/layer/Tile';
import { mapAtom, ProjectionIdentifier } from '../atoms';
import { VectorTileLayerName } from './backgroundVectorTiles';
import { getWMSLayer, WMSLayerName } from './backgroundWMS';
import { loadableWMTS, WMTSLayerName } from './backgroundWMTSProviders';

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
  projection: ProjectionIdentifier,
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
    case 'EPSG:25834':
      return null; // Not available as WMTS layer
    case 'EPSG:25835':
      return 'Nibcache_UTM35_EUREF89_v2';
    case 'EPSG:25836':
      return null; // Not available as WMTS layer
  }
};

export const useBackgoundLayers = () => {
  const map = useAtomValue(mapAtom);
  const WMTSProviders = useAtomValue(loadableWMTS);
  const backgroundLayerState = WMTSProviders.state;

  const getBackgroundLayer = async (
    backgroundLayerName: BackgroundLayerName,
  ) => {
    if (WMTSProviders.state === 'loading') {
      return null;
    }
    if (WMTSProviders.state === 'hasError') {
      console.error('Error loading WMTS providers:', WMTSProviders.error);
      return null;
    }

    const { isVectorTileLayer, createVectorTileLayer } = await import(
      './backgroundVectorTiles'
    );
    if (isVectorTileLayer(backgroundLayerName)) {
      return await createVectorTileLayer(backgroundLayerName);
    }

    const currentProjection: ProjectionIdentifier = map
      .getView()
      .getProjection()
      .getCode() as ProjectionIdentifier;

    const wmsLayer = getWMSLayer(
      backgroundLayerName as WMSLayerName,
      currentProjection,
    );
    if (wmsLayer) {
      return wmsLayer;
    }

    const avialableWMTSLayersForProjection: Map<WMTSLayerName, TileLayer> =
      new Map();

    WMTSProviders.data.forEach((projectionLayerMap) => {
      const layersForProjection = projectionLayerMap.get(currentProjection);
      if (layersForProjection) {
        layersForProjection.forEach((source, layerName) => {
          const layer = new TileLayer({
            source: source,
            preload: Infinity,
            properties: {
              id: `bg.${layerName}`,
            },
          });
          avialableWMTSLayersForProjection.set(layerName, layer);
        });
      }
    });

    if (isLayerNiBLayer(backgroundLayerName)) {
      const nibLayerName = getNiBLayerNameForProjection(currentProjection);
      if (nibLayerName) {
        return avialableWMTSLayersForProjection.get(nibLayerName) || null;
      } else {
        console.warn(
          `NiB layer ${backgroundLayerName} is not available for projection ${currentProjection}`,
        );
        return null;
      }
    }

    //Handle NiB boogaloo here

    return (
      avialableWMTSLayersForProjection.get(
        backgroundLayerName as WMTSLayerName,
      ) || null
    );
  };

  return { backgroundLayerState, getBackgroundLayer };
};
