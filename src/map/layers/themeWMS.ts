import TileLayer from 'ol/layer/Tile';
import { TileWMS } from 'ol/source';
import type {
  ThemeLayerConfig,
  ThemeLayerDefinition,
} from '../../api/themeLayerConfigApi';
import { getEffectiveWmsUrl } from '../../api/themeLayerConfigApi';
import { getEnv } from '../../env';

type LocationNameLayerName = 'economicMapFirstEdition' | 'amtMap';

type PropertyLayerName = 'adresses' | 'buildings' | 'parcels';
type OutdoorsLifeLayerName =
  | 'hikingTrails'
  | 'skiingTrails'
  | 'routeInfoPoints'
  | 'bikeTrails'
  | 'waterTrails';
type FactsLayerName = 'osloMarkaBorder';

type ConfigThemeLayerName =
  | 'historicalRoute'
  | 'coastalTrail'
  | 'culturalTrail'
  | 'natureTrail'
  | 'trimTrack'
  | 'footRouteTypeNotSpecified'
  | 'machinePrepared'
  | 'snowmobile'
  | 'unprepared'
  | 'preparationNotSpecified'
  | 'norwegianPlaceNames'
  | 'luleSamiPlaceNames'
  | 'northernSamiPlaceNames'
  | 'skoltSamiPlaceNames'
  | 'southernSamiPlaceNames'
  | 'kvenPlaceNames'
  | 'otherPlaceNames'
  | 'nivBenchmarks'
  | 'landNetPoints'
  | 'primaryNetPoints'
  | 'triangulationPoints'
  | 'nrlArea'
  | 'nrlLine'
  | 'nrlAirspan'
  | 'nrlMast'
  | 'nrlPoint'
  | 'accessibilityRoads'
  | 'accessibilityHcParkering'
  | 'accessibilityBuildingEntrance'
  | 'accessibilityParkingArea'
  | 'accessibilityToilet'
  | 'accessibilitySittegruppebenk';

export type ThemeLayerName =
  | PropertyLayerName
  | OutdoorsLifeLayerName
  | FactsLayerName
  | LocationNameLayerName
  | ConfigThemeLayerName;

const ENV = getEnv();

export const createThemeLayerFromConfig = (
  config: ThemeLayerConfig,
  layerDef: ThemeLayerDefinition,
  projection: string,
): TileLayer => {
  const wmsUrl = getEffectiveWmsUrl(config, layerDef);

  return new TileLayer({
    source: new TileWMS({
      url: wmsUrl,
      params: {
        LAYERS: layerDef.layers,
        TILED: true,
        TRANSPARENT: true,
        SRS: projection,
        ...(layerDef.styles ? { STYLES: layerDef.styles } : {}),
      },
      projection: projection,
      cacheSize: 512,
      transition: 0,
    }),
    properties: {
      id: `theme.${layerDef.id}`,
    },
    preload: 1,
  });
};

export const getThemeWMSLayer = (
  layerName: ThemeLayerName,
  projection: string,
): TileLayer | null => {
  switch (layerName) {
    case 'adresses':
      return new TileLayer({
        source: new TileWMS({
          url: `${ENV.apiUrl}/v1/matrikkel/wms`,
          params: {
            LAYERS: 'matrikkel:MATRIKKELADRESSEWFS,matrikkel:VEGADRESSEWFS',
            TILED: true,
            TRANSPARENT: true,
            SRS: projection,
          },
          projection: projection,
        }),
        properties: {
          id: `theme.${layerName}`,
        },
      });
    case 'buildings':
      return new TileLayer({
        source: new TileWMS({
          url: `${ENV.apiUrl}/v1/matrikkel/wms`,
          params: {
            LAYERS: 'matrikkel:BYGNINGWFS',
            TILED: true,
            TRANSPARENT: true,
            SRS: projection,
          },
          projection: projection,
        }),
        properties: {
          id: `theme.${layerName}`,
        },
      });
    case 'parcels':
      return new TileLayer({
        source: new TileWMS({
          url: `${ENV.apiUrl}/v1/matrikkel/wms`,
          params: {
            LAYERS: 'matrikkel:TEIGGRENSEWFS,matrikkel:TEIGWFS',
            TILED: true,
            TRANSPARENT: true,
            SRS: projection,
            STYLES: ',Matrikkelnummer',
          },
          projection: projection,
        }),
        properties: {
          id: `theme.${layerName}`,
        },
      });

    //Shared handling for outdoors life layers
    case 'hikingTrails':
    case 'routeInfoPoints':
    case 'skiingTrails':
    case 'bikeTrails':
    case 'waterTrails':
      return getOutdoorsLifeWMSLayer(layerName, projection);
    case 'osloMarkaBorder':
      return getNorwayFactsWMSLayer(layerName, projection);
    case 'economicMapFirstEdition':
      return getGeoNorgeWMSLayer(
        'n5raster2',
        projection,
        'n5raster_foerstegang_metadata,n5raster_foerstegang',
        layerName,
      );
    case 'amtMap':
      return getGeoNorgeWMSLayer(
        'historiskekart',
        projection,
        'amt1',
        layerName,
      );
    default:
      return null;
  }
};

const getNorwayFactsWMSLayer = (
  layerName: FactsLayerName,
  projection: string,
): TileLayer | null => {
  let wmsLayerName: string;
  switch (layerName) {
    case 'osloMarkaBorder':
      wmsLayerName = 'Markagrensen';
      break;
  }

  return getGeoNorgeWMSLayer(
    'markagrensen',
    projection,
    wmsLayerName,
    layerName,
  );
};

const getOutdoorsLifeWMSLayer = (
  layerName: OutdoorsLifeLayerName,
  projection: string,
): TileLayer | null => {
  let wmsLayerName: string;
  switch (layerName) {
    case 'hikingTrails':
      wmsLayerName = 'Fotrute';
      break;
    case 'skiingTrails':
      wmsLayerName = 'Skiloype';
      break;
    case 'routeInfoPoints':
      wmsLayerName = 'Ruteinfopunkt';
      break;
    case 'bikeTrails':
      wmsLayerName = 'Sykkelrute';
      break;
    case 'waterTrails':
      wmsLayerName = 'AnnenRute';
      break;
  }

  return getGeoNorgeWMSLayer(
    'friluftsruter2',
    projection,
    wmsLayerName,
    layerName,
  );
};

const getGeoNorgeWMSLayer = (
  wmsName: string,
  projection: string,
  layerNames: string,
  layerId: string,
): TileLayer => {
  return new TileLayer({
    source: new TileWMS({
      url: `${ENV.layerProviderParameters.geoNorgeWMS.baseUrl}.${wmsName}`,
      params: {
        LAYERS: layerNames,
        TILED: true,
        TRANSPARENT: true,
        SRS: projection,
      },
      projection: projection,
    }),
    properties: {
      id: `theme.${layerId}`,
    },
  });
};
