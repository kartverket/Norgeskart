import { getEnv } from '../../../../env';
import { BackgroundLayerName } from '../../backgroundLayers';
import { BackgroundLayer, LayerProvider } from './types';

const env = getEnv();

const createNibCapabilitiesUrl = (layerName: BackgroundLayerName): string => {
  const baseUrl = env.layerProviderParameters.norgeIBilder.baseUrl;
  const token = env.layerProviderParameters.norgeIBilder.apiKey;
  switch (layerName) {
    case 'Nibcache_web_mercator_v2':
      return `${baseUrl}/arcgis/rest/services/Nibcache_web_mercator_v2/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?token=${token}`;
    case 'Nibcache_UTM32_EUREF89_v2':
      return `${baseUrl}/arcgis/rest/services/Nibcache_UTM32_EUREF89_v2/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?token=${token}`;
    case 'Nibcache_UTM33_EUREF89_v2':
      return `${baseUrl}/arcgis/rest/services/Nibcache_UTM33_EUREF89_v2/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?token=${token}`;
    case 'Nibcache_UTM35_EUREF89_v2':
      return `${baseUrl}/arcgis/rest/services/Nibcache_UTM35_EUREF89_v2/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?token=${token}`;
    default:
      throw new Error(
        `Unsupported layer name for NiB capabilities URL: ${layerName}`,
      );
  }
};

const NiBWebMercatorProvider: LayerProvider = {
  capabilitiesUrl: createNibCapabilitiesUrl('Nibcache_web_mercator_v2'),
};

const NiBUTM32Provider: LayerProvider = {
  capabilitiesUrl: createNibCapabilitiesUrl('Nibcache_UTM32_EUREF89_v2'),
};

const NiBUTM33Provider: LayerProvider = {
  capabilitiesUrl: createNibCapabilitiesUrl('Nibcache_UTM33_EUREF89_v2'),
};

const NiBUTM35Provider: LayerProvider = {
  capabilitiesUrl: createNibCapabilitiesUrl('Nibcache_UTM35_EUREF89_v2'),
};

export const nibBackgroundLayers: BackgroundLayer[] = [
  {
    layerName: 'Nibcache_web_mercator_v2',
    provider: NiBWebMercatorProvider,
    showForProjections: ['EPSG:3857'],
    requiredProjection: 'EPSG:3857',
  },
  {
    layerName: 'Nibcache_UTM32_EUREF89_v2',
    provider: NiBUTM32Provider,
    showForProjections: ['EPSG:25832'],
    requiredProjection: 'EPSG:25832',
  },
  {
    layerName: 'Nibcache_UTM33_EUREF89_v2',
    provider: NiBUTM33Provider,
    showForProjections: ['EPSG:25833'],
    requiredProjection: 'EPSG:25833',
  },
  {
    layerName: 'Nibcache_UTM35_EUREF89_v2',
    provider: NiBUTM35Provider,
    showForProjections: ['EPSG:25835'],
    requiredProjection: 'EPSG:25835',
  },
];
