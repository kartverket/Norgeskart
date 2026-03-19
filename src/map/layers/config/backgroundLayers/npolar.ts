import { getEnv } from '../../../../env';
import { BackgroundLayer, LayerProvider } from './types';

const env = getEnv();

const JanMaynProvider: LayerProvider = {
  capabilitiesUrl:
    env.layerProviderParameters.npolar.baseUrl +
    '/arcgis/rest/services/Basisdata/NP_Basiskart_JanMayen_WMTS_25833/MapServer/WMTS?Request=GetCapabilities&Service=WMTS',
};

const SvalbardProvider: LayerProvider = {
  capabilitiesUrl:
    env.layerProviderParameters.npolar.baseUrl +
    '/arcgis/rest/services/Basisdata/NP_Basiskart_Svalbard_WMTS_25833/MapServer/WMTS?Request=GetCapabilities&Service=WMTS',
};

export const npolarBackgroundLayers: BackgroundLayer[] = [
  {
    type: 'WMTS',
    layerName: 'Basisdata_NP_Basiskart_JanMayen_WMTS_25833',
    provider: JanMaynProvider,
    requiredProjection: 'EPSG:25833',
    moveToExtent: [-393783.25, 7978220.98, -276963.74, 8084965.52],
  },
  {
    type: 'WMTS',
    layerName: 'Basisdata_NP_Basiskart_Svalbard_WMTS_25833',
    provider: SvalbardProvider,
    requiredProjection: 'EPSG:25833',
    moveToExtent: [369976.39, 8221306.54, 878234.72, 9010718.77],
  },
];
