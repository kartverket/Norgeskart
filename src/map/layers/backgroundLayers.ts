import { useAtomValue } from 'jotai';
import TileLayer from 'ol/layer/Tile';
import { mapAtom, ProjectionIdentifier } from '../atoms';
import { getWMSLayer, WMSLayerName } from './backgroundWMS';
import { loadableWMTS, WMTSLayerName } from './backgroundWMTSProviders';

export type BackgroundLayerName = WMTSLayerName | WMSLayerName;

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
    case 'EPSG:25835':
      return 'Nibcache_UTM35_EUREF89_v2';
  }
};

export const useBackgoundLayers = () => {
  const map = useAtomValue(mapAtom);
  const WMTSProviders = useAtomValue(loadableWMTS);
  const backgroundLayerState = WMTSProviders.state;

  const getBackgroundLayer = (backgroundLayerName: BackgroundLayerName) => {
    if (WMTSProviders.state === 'loading') {
      return null;
    }
    if (WMTSProviders.state === 'hasError') {
      console.error('Error loading WMTS providers:', WMTSProviders.error);
      return null;
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
