import ImageLayer from 'ol/layer/Image.js';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { ImageWMS, TileWMS } from 'ol/source';
import { createGeoJsonThemeLayer } from './themeGeoJson';
import type {
  ThemeLayerConfig,
  ThemeLayerDefinition,
} from './themeLayerConfigApi';
import {
  getCategoryById,
  getEffectiveWmsUrl,
  getParentCategory,
} from './themeLayerConfigApi';

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

type TopoMapserverLayerName =
  | 'topoMs_lag01_hav'
  | 'topoMs_lag02_dybdelag_gebco'
  | 'topoMs_lag03_dybdelag_sjo'
  | 'topoMs_lag04_Europa'
  | 'topoMs_lag05_hoydelag'
  | 'topoMs_lag06_elveflate'
  | 'topoMs_lag07_sjodybde'
  | 'topoMs_lag08_arealdekke'
  | 'topoMs_lag09_relieff_sol'
  | 'topoMs_lag10_hoydekurve_og_n50bre'
  | 'topoMs_lag11_relieff_skygge'
  | 'topoMs_lag12_innsjoflate'
  | 'topoMs_lag13_grense_adm_maritim_fare_naturvern'
  | 'topoMs_lag14_vannkontur_elvbekk'
  | 'topoMs_lag15_fkb_bygnanlegg'
  | 'topoMs_lag16_fkb_samferdselflate_terreng'
  | 'topoMs_lag17_samferdsel_anlegg'
  | 'topoMs_lag18_samferdsel_tunnel'
  | 'topoMs_lag19_samferdsel_batrute'
  | 'topoMs_lag20_samferdsel_terreng'
  | 'topoMs_lag21_bygning_anlegg'
  | 'topoMs_lag22_samferdsel_bru'
  | 'topoMs_lag23_bygning_bygningslinje'
  | 'topoMs_lag24_lufthavn'
  | 'topoMs_lag24_lufthavn_S3'
  | 'topoMs_lag25_kraftlinje_taubane'
  | 'topoMs_lag26_hoydepunkt'
  | 'topoMs_lag27_sykehus_m_akuttmottak'
  | 'topoMs_lag28_adm_grensepunkt'
  | 'topoMs_lag29_hoydetall'
  | 'topoMs_lag29_n5000_stedsnavn_matview'
  | 'topoMs_lag30_n2000_stedsnavn_matview'
  | 'topoMs_lag30_stedsnavn_vegnummer_og_adresse'
  | 'topoMs_lag31_n1000_stedsnavn_matview'
  | 'topoMs_lag32_n500_hoydetall_matview_geometri'
  | 'topoMs_lag33_n500_stedsnavn_matview'
  | 'topoMs_lag34_n250_hoydetall_matview_geometri'
  | 'topoMs_lag35_n250_stedsnavn_matview'
  | 'topoMs_lag36_n100_hoydetall_matview_geometri'
  | 'topoMs_lag37_n100_stedsnavn_matview'
  | 'topoMs_lag38_n50_hoydetall_matview_geometri'
  | 'topoMs_lag39_n50_stedsnavn_matview'
  | 'topoMs_lag40_n5_stedsnavn_og_hoydetall'
  | 'topoMs_lag41_vegnummer'
  | 'topoMs_lag42_adresse'
  | 'topoMs_lag43_gatenavn'
  | 'topoMs_lag44_Svalbard'
  | 'topoMs_lag45_Jan_Mayen';

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
  | SjoLayerName
  | TopoMapserverLayerName;

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
): TileLayer | VectorLayer | ImageLayer<ImageWMS> | null => {
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

  const layerProperties = {
    id: `theme.${layerDef.id}`,
    queryable: layerDef.queryable ?? false,
    layerTitle: layerDef.name.nb || layerDef.id,
    ...(infoFormat ? { infoFormat } : {}),
    ...(featureInfoImageBaseUrl ? { featureInfoImageBaseUrl } : {}),
    ...(featureInfoFields ? { featureInfoFields } : {}),
  };

  const wmsParams = {
    LAYERS: layerDef.layers,
    TRANSPARENT: true,
    SRS: projection,
    ...(layerDef.styles ? { STYLES: layerDef.styles } : {}),
    FILTER: layerDef.filter ? layerDef.filter : undefined,
  };

  if (layerDef.singleImage) {
    return new ImageLayer({
      source: new ImageWMS({
        url: wmsUrl,
        params: wmsParams,
        projection: projection,
      }),
      properties: layerProperties,
    });
  }

  return new TileLayer({
    source: new TileWMS({
      url: wmsUrl,
      params: { ...wmsParams, TILED: true },
      projection: projection,
      cacheSize: 512,
      transition: 0,
    }),
    properties: layerProperties,
    preload: 1,
  });
};
