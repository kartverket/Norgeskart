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
  | 'sjoGrunnlinje'
  | 'sjoTerritorialgrense'
  | 'sjoTilstotendeSone'
  | 'sjoNorgesOkonomiskeSone'
  | 'sjoFiskevernsonen'
  | 'sjoFiskerisonen'
  | 'sjoKontinentalsokkel'
  | 'sjoAvtaltAvgrensningslinje';

type FullstendighetsdekningLayerName =
  | 'fd_adresse'
  | 'fd_aktsomhetskart_jord_flomskred'
  | 'fd_aktsomhetskart_kvikkleireskred'
  | 'fd_aktsomhetskart_snoskred'
  | 'fd_akvakulturlokaliteter'
  | 'fd_anadrome_laksefisk_strekninger'
  | 'fd_ankringsomrader'
  | 'fd_ar50_arealtyper'
  | 'fd_arealbruk'
  | 'fd_banenettverk'
  | 'fd_barmarksloyper'
  | 'fd_befolkning_rutenett_1000_2025'
  | 'fd_befolkning_rutenett_250_2025'
  | 'fd_bergrettigheter'
  | 'fd_brannsmitteomrader'
  | 'fd_byggeforbudssoner'
  | 'fd_byggerestriksjoner_bra'
  | 'fd_bygningspunkt'
  | 'fd_digitale_ortofoto'
  | 'fd_dtm10_utm33'
  | 'fd_dyrkbar_jord'
  | 'fd_eiendomskart_teig'
  | 'fd_eksplosivanlegg'
  | 'fd_farlig_stoff_anlegg'
  | 'fd_fiskeplasser_redskap'
  | 'fd_fiskerihavner'
  | 'fd_fkb_ar5'
  | 'fd_fkb_arealbruk'
  | 'fd_fkb_bygnanlegg'
  | 'fd_fkb_hoydekurve'
  | 'fd_fkb_traktorvegsti'
  | 'fd_fkb_veg'
  | 'fd_fkb_bygning'
  | 'fd_fkb_vann'
  | 'fd_flom_aktsomhetsomrader'
  | 'fd_flomsoner'
  | 'fd_flyttlei'
  | 'fd_forenklet_elveg2'
  | 'fd_forsvarets_skyte_ovingsfelt_land'
  | 'fd_forsvarets_skyte_ovingsfelt_sjo'
  | 'fd_geologisk_arv'
  | 'fd_grus_pukk'
  | 'fd_gyteomrader'
  | 'fd_hovedled_biled'
  | 'fd_hovedled_biled_arealgrense'
  | 'fd_inngrepsfri_natur_i_norge'
  | 'fd_kommuner'
  | 'fd_lassettingsplasser'
  | 'fd_marin_grense'
  | 'fd_markagrensen'
  | 'fd_matrikkelen'
  | 'fd_n20_kartdata'
  | 'fd_n20bygning'
  | 'fd_n250'
  | 'fd_n5_kartdata'
  | 'fd_n5_presentasjonsdata'
  | 'fd_n5_raster'
  | 'fd_n50'
  | 'fd_nasjonale_laksefjorder'
  | 'fd_naturvernomrader'
  | 'fd_naturvernomrader_foreslatte'
  | 'fd_navigasjonsinstallasjoner'
  | 'fd_ramsaromrader'
  | 'fd_reinbeitedistrikt'
  | 'fd_reinbeiteomrade'
  | 'fd_reindrift_avtaleomrade'
  | 'fd_reindrift_beitehage'
  | 'fd_reindrift_ekspropriasjonsomrade'
  | 'fd_reindrift_hostbeite'
  | 'fd_reindrift_hostvinterbeite'
  | 'fd_reindrift_konsesjonsomrade'
  | 'fd_reindrift_konvensjonsomrade'
  | 'fd_reindrift_oppsamlingsomrade'
  | 'fd_reindrift_restriksjonsomrade'
  | 'fd_reindrift_samebyavtale'
  | 'fd_reindrift_samebyrettsavgjorelse'
  | 'fd_reindrift_siidaomrade'
  | 'fd_reindrift_sommerbeite'
  | 'fd_reindrift_trekklei'
  | 'fd_reindrift_varbeite'
  | 'fd_reindrift_vinterbeiteomrade'
  | 'fd_reindriftsanlegg'
  | 'fd_restriksjonsplaner_avinor'
  | 'fd_sjokart_dybdedata'
  | 'fd_sjokart_raster_hovedkart'
  | 'fd_skredhendelser'
  | 'fd_snoscooterloyper'
  | 'fd_spr_strandsonen'
  | 'fd_statlig_sikra_friluftsomrader'
  | 'fd_stedsnavn_forenklet'
  | 'fd_steinsprang_aktsomhetsomr'
  | 'fd_stormflo_havniva'
  | 'fd_storulykkeanlegg'
  | 'fd_stoysoner_forsvarets_flyplasser'
  | 'fd_stoysoner_lufthavn'
  | 'fd_stoysoner_skyte_og_ovingsfelt'
  | 'fd_tare_hostefelt'
  | 'fd_tettsteder_2025'
  | 'fd_tilgjengelighet'
  | 'fd_trafikkmengde'
  | 'fd_trafikkulykker'
  | 'fd_tur_og_friluftsruter'
  | 'fd_vannforekomster'
  | 'fd_vannkraft_utbygd_ikkeutbygd'
  | 'fd_vassdrag_verneplan'
  | 'fd_verneverdig_tette_trehusmiljoer'
  | 'fd_villreinomrader'
  | 'fd_vindkraftverk';

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
  | FullstendighetsdekningLayerName;

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
