import { getEnv } from '../../../../env';
import { ThemeLayerConfig } from '../../themeLayerConfigApi';
const env = getEnv();

export const borderConfig: ThemeLayerConfig = {
  categories: [
    {
      id: 'borders',
      groupid: 3,
      name: {
        nb: 'Grenser',
        nn: 'Grenser',
        en: 'Borders',
      },
    },
    {
      id: 'sjo_nmg',
      groupid: 3,
      name: {
        nb: 'Norges maritime grenser',
        nn: 'Noregs maritime grenser',
        en: "Norway's maritime borders",
      },
      wmsUrl: 'https://wms.geonorge.no/skwms1/wms.nmg',
      infoFormat: 'text/plain',
      parentId: 'borders',
    },
  ],
  layers: [
    {
      id: 'osloMarkaBorder',
      name: {
        nb: 'Markagrensen',
        nn: 'Markagrensa',
        en: 'Oslo Marka border',
      },
      layers: 'Markagrensen',
      categoryId: 'borders',
      wmsUrl: env.layerProviderParameters.geoNorgeWMS.baseUrl + '.markagrensen',
      groupid: 3,
      legacyId: '1026',
      queryable: false,
    },
    {
      id: 'countyBorders',
      name: {
        nb: 'Fylkesgrenser',
        nn: 'Fylkesgrenser',
        en: 'County borders',
      },
      layers: 'fylker',
      categoryId: 'borders',
      wmsUrl: env.layerProviderParameters.geoNorgeWMS.baseUrl + '.adm_enheter2',
      groupid: 3,
      queryable: false,
    },
    {
      id: 'municipalityBorders',
      name: {
        nb: 'Kommunegrenser',
        nn: 'Kommunegrenser',
        en: 'Municipality borders',
      },
      layers: 'kommuner',
      categoryId: 'borders',
      wmsUrl: env.layerProviderParameters.geoNorgeWMS.baseUrl + '.adm_enheter2',
      groupid: 3,
      queryable: false,
    },
    // --- Norges maritime grenser layers ---
    {
      id: 'sjoGrunnlinje',
      name: {
        nb: 'Grunnlinje',
        nn: 'Grunnlinje',
        en: 'Baseline',
      },
      layers: 'Grunnlinje',
      categoryId: 'sjo_nmg',
      groupid: 3,
      queryable: true,
      useLegendGraphic: true,
    },
    {
      id: 'sjoTerritorialgrense',
      name: {
        nb: 'Territorialgrense',
        nn: 'Territorialgrense',
        en: 'Territorial border',
      },
      layers: 'Territorialgrense',
      categoryId: 'sjo_nmg',
      groupid: 14,
      queryable: true,
      useLegendGraphic: true,
    },
    {
      id: 'sjoTilstotendeSone',
      name: {
        nb: 'Tilstøtende sone',
        nn: 'Tilstøytande sone',
        en: 'Contiguous zone',
      },
      layers: 'Tilstotende_sone',
      categoryId: 'sjo_nmg',
      groupid: 14,
      queryable: true,
      useLegendGraphic: true,
    },
    {
      id: 'sjoNorgesOkonomiskeSone',
      name: {
        nb: 'Norges økonomiske sone',
        nn: 'Noregs økonomiske sone',
        en: "Norway's economic zone",
      },
      layers: 'Norges_okonomiske_sone',
      categoryId: 'sjo_nmg',
      groupid: 14,
      queryable: true,
      useLegendGraphic: true,
    },
    {
      id: 'sjoFiskevernsonen',
      name: {
        nb: 'Fiskevernsonen ved Svalbard',
        nn: 'Fiskevernsona ved Svalbard',
        en: 'Fisheries protection zone Svalbard',
      },
      layers: 'Fiskevernsonen_ved_Svalbard',
      categoryId: 'sjo_nmg',
      groupid: 14,
      queryable: true,
      useLegendGraphic: true,
    },
    {
      id: 'sjoFiskerisonen',
      name: {
        nb: 'Fiskerisonen ved Jan Mayen',
        nn: 'Fiskerisona ved Jan Mayen',
        en: 'Fisheries zone Jan Mayen',
      },
      layers: 'Fiskerisonen_ved_Jan_Mayen',
      categoryId: 'sjo_nmg',
      groupid: 14,
      queryable: true,
      useLegendGraphic: true,
    },
    {
      id: 'sjoKontinentalsokkel',
      name: {
        nb: 'Norges kontinentalsokkel',
        nn: 'Noregs kontinentalsokkel',
        en: "Norway's continental shelf",
      },
      layers: 'Norges_kontinentalsokkel',
      categoryId: 'sjo_nmg',
      groupid: 14,
      queryable: true,
      useLegendGraphic: true,
    },
    {
      id: 'sjoAvtaltAvgrensningslinje',
      name: {
        nb: 'Avtalt avgrensningslinje',
        nn: 'Avtalt avgrensningslinje',
        en: 'Agreed delimitation line',
      },
      layers: 'Avtalt_avgrensningslinje',
      categoryId: 'sjo_nmg',
      groupid: 14,
      queryable: true,
      useLegendGraphic: true,
    },
  ],
};
