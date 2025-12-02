import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { TileWMS } from 'ol/source';
import type {
  ThemeLayerConfig,
  ThemeLayerDefinition,
} from '../../api/themeLayerConfigApi';
import {
  getCategoryById,
  getEffectiveWmsUrl,
  getParentCategory,
} from '../../api/themeLayerConfigApi';
import { getEnv } from '../../env';
import { createGeoJsonThemeLayer } from './themeGeoJson';

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

export const QUERYABLE_LAYERS: ThemeLayerName[] = [
  'adresses',
  'buildings',
  'parcels',
  'hikingTrails',
  'skiingTrails',
  'routeInfoPoints',
  'bikeTrails',
  'waterTrails',
];

const ENV = getEnv();

export const createThemeLayerFromConfig = (
  config: ThemeLayerConfig,
  layerDef: ThemeLayerDefinition,
  projection: string,
): TileLayer | VectorLayer | null => {
  if (layerDef.type === 'geojson' && layerDef.geojsonUrl) {
    return createGeoJsonThemeLayer(layerDef, projection);
  }

  if (!layerDef.layers) {
    console.warn(`Layer ${layerDef.id} has no WMS layers defined`);
    return null;
  }

  const wmsUrl = getEffectiveWmsUrl(config, layerDef);

  const category = getCategoryById(config, layerDef.categoryId);
  const parentCategory = category
    ? getParentCategory(config, category)
    : undefined;
  const infoFormat =
    layerDef.infoFormat || category?.infoFormat || parentCategory?.infoFormat;
  const featureInfoImageBaseUrl =
    layerDef.featureInfoImageBaseUrl ||
    category?.featureInfoImageBaseUrl ||
    parentCategory?.featureInfoImageBaseUrl;
  const featureInfoFields =
    layerDef.featureInfoFields ||
    category?.featureInfoFields ||
    parentCategory?.featureInfoFields;

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
      queryable: layerDef.queryable ?? false,
      layerTitle: layerDef.name.nb || layerDef.id,
      ...(infoFormat ? { infoFormat } : {}),
      ...(featureInfoImageBaseUrl ? { featureInfoImageBaseUrl } : {}),
      ...(featureInfoFields ? { featureInfoFields } : {}),
    },
    preload: 1,
  });
};

export const getThemeWMSLayer = (
  layerName: ThemeLayerName,
  projection: string,
): TileLayer | null => {
  const isQueryable = QUERYABLE_LAYERS.includes(layerName);

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
          queryable: isQueryable,
          layerTitle: 'Adresser',
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
          queryable: isQueryable,
          layerTitle: 'Bygninger',
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
          queryable: isQueryable,
          layerTitle: 'Teiggrenser',
        },
      });

    //Shared handling for outdoors life layers
    case 'hikingTrails':
    case 'routeInfoPoints':
    case 'skiingTrails':
    case 'bikeTrails':
    case 'waterTrails':
      return getOutdoorsLifeWMSLayer(layerName, projection, isQueryable);
    case 'osloMarkaBorder':
      return getNorwayFactsWMSLayer(layerName, projection);
    case 'economicMapFirstEdition':
      return getGeoNorgeWMSLayer(
        'n5raster2',
        projection,
        'n5raster_foerstegang_metadata,n5raster_foerstegang',
        layerName,
        false,
      );
    case 'amtMap':
      return getGeoNorgeWMSLayer(
        'historiskekart',
        projection,
        'amt1',
        layerName,
        false,
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
    false,
  );
};

const getOutdoorsLifeWMSLayer = (
  layerName: OutdoorsLifeLayerName,
  projection: string,
  isQueryable: boolean,
): TileLayer | null => {
  let wmsLayerName: string;
  let layerTitle: string;
  switch (layerName) {
    case 'hikingTrails':
      wmsLayerName = 'Fotrute';
      layerTitle = 'Fotruter';
      break;
    case 'skiingTrails':
      wmsLayerName = 'Skiloype';
      layerTitle = 'Skiløyper';
      break;
    case 'routeInfoPoints':
      wmsLayerName = 'Ruteinfopunkt';
      layerTitle = 'Ruteinfopunkt';
      break;
    case 'bikeTrails':
      wmsLayerName = 'Sykkelrute';
      layerTitle = 'Sykkelruter';
      break;
    case 'waterTrails':
      wmsLayerName = 'AnnenRute';
      layerTitle = 'Andre ruter';
      break;
  }

  return getGeoNorgeWMSLayer(
    'friluftsruter2',
    projection,
    wmsLayerName,
    layerName,
    isQueryable,
    layerTitle,
  );
};

const getGeoNorgeWMSLayer = (
  wmsName: string,
  projection: string,
  layerNames: string,
  layerId: string,
  isQueryable: boolean,
  layerTitle?: string,
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
      queryable: isQueryable,
      layerTitle: layerTitle || layerId,
    },
  });
};
