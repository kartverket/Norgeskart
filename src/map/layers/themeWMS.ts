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
import { createGeoJsonThemeLayer } from './themeGeoJson';

type HistoricalMapsLayerName = 'economicMapFirstEdition' | 'amtMap';

type StedsnavnLayerName =
  | 'norwegianPlaceNames'
  | 'luleSamiPlaceNames'
  | 'northernSamiPlaceNames'
  | 'skoltSamiPlaceNames'
  | 'southernSamiPlaceNames'
  | 'kvenPlaceNames'
  | 'otherPlaceNames'
  | 'administrativeAreasPlaceNames'
  | 'settlementPlaceNames'
  | 'infrastructurePlaceNames'
  | 'seaPlaceNames'
  | 'landTypePlaceNames'
  | 'freshwaterPlaceNames'
  | 'terrainPlaceNames'
  | 'culturePlaceNames'
  | 'approvedPlaceNames'
  | 'approvedNamePartPlaceNames'
  | 'acceptedPlaceNames'
  | 'internationalPlaceNames'
  | 'privatePlaceNames'
  | 'historicalPlaceNames'
  | 'proposedPlaceNames'
  | 'unevaluatedPlaceNames'
  | 'rejectedNamePartPlaceNames'
  | 'rejectedPlaceNames'
  | 'caseStatusUntreatedPlaceNames'
  | 'notToBeProcessedPlaceNames'
  | 'approvedByAuthorityPlaceNames'
  | 'collectiveDecisionPlaceNames'
  | 'collectiveDecisionWithdrawnPlaceNames'
  | 'caseRaisedPlaceNames'
  | 'caseDecisionPlaceNames'
  | 'decisionPostponedPlaceNames'
  | 'appealDecisionNotWithdrawnPlaceNames'
  | 'appealDecisionWithdrawnPlaceNames'
  | 'appealDecisionPostponedPlaceNames'
  | 'simplifiedDecisionPlaceNames'
  | 'decision24MonthsPlaceNames'
  | 'decision12MonthsPlaceNames'
  | 'decision6MonthsPlaceNames'
  | 'decision3MonthsPlaceNames'
  | 'decision1MonthPlaceNames'
  | 'collectiveDecision24MonthsPlaceNames'
  | 'collectiveDecision12MonthsPlaceNames'
  | 'collectiveDecision6MonthsPlaceNames'
  | 'collectiveDecision3MonthsPlaceNames'
  | 'collectiveDecision1MonthPlaceNames';

type PropertyLayerName = 'adresses' | 'buildings' | 'parcels';
type OutdoorsLifeLayerName =
  | 'hikingTrails'
  | 'skiingTrails'
  | 'routeInfoPoints'
  | 'bikeTrails'
  | 'waterTrails';
type FactsLayerName = 'osloMarkaBorder';

type SjoLayerName =
  | 'sjoDybdedatakvalitetSjokart'
  | 'sjoIkkeSjomalt'
  | 'sjoFarligeBolger'
  | 'sjoAktsomhetsomradeFarligeBolger'
  | 'sjoDybdeforhold'
  | 'sjoDybdekoter10m'
  | 'sjoHelning'
  | 'sjoHelningOver30'
  | 'sjoNaturtyper'
  | 'sjoKornstorrelseDet'
  | 'sjoGravbarhet'
  | 'sjoBunnfellingsomrader'
  | 'sjoAnkringsforhold'
  | 'sjoGrunnlinje'
  | 'sjoTerritorialgrense'
  | 'sjoTilstotendeSone'
  | 'sjoNorgesOkonomiskeSone'
  | 'sjoFiskevernsonen'
  | 'sjoFiskerisonen'
  | 'sjoKontinentalsokkel'
  | 'sjoAvtaltAvgrensningslinje';

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
  | HistoricalMapsLayerName
  | StedsnavnLayerName
  | ConfigThemeLayerName
  | SjoLayerName;

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
        FILTER: layerDef.filter ? layerDef.filter : undefined,
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
