import { ThemeLayerConfig } from '../../../api/themeLayerConfigApi';

export const sjoConfig: ThemeLayerConfig = {
  categories: [
    {
      id: 'sjo',
      groupid: 14,
      name: {
        nb: 'Til Sjøs',
        nn: 'Til Sjøs',
        en: 'At Sea',
      },
    },
    {
      id: 'sjo_dybdedatakvalitet',
      groupid: 14,
      name: {
        nb: 'Dybdedatakvalitet',
        nn: 'Djupdatakvalitet',
        en: 'Depth data quality',
      },
      wmsUrl: 'https://wms.geonorge.no/skwms1/wms.dybdedatakvalitet_navigasjon',
      parentId: 'sjo',
    },
    {
      id: 'sjo_farlige_bolger',
      groupid: 14,
      name: {
        nb: 'Farlige bølger',
        nn: 'Farlege bølgjer',
        en: 'Dangerous waves',
      },
      wmsUrl: 'https://wms.geonorge.no/skwms1/wms.farlige_bolger',
      infoFormat: 'text/plain',
      parentId: 'sjo',
      featureInfoFields: [
        {
          name: 'omradenavn',
          alias: 'Områdenavn',
        },
        {
          name: 'informasjonnorsk',
          alias: 'Norsk',
        },
        {
          name: 'informasjonengelsk',
          alias: 'English',
        },
        {
          name: 'informasjonnorskfulltekst',
          alias: 'Norsk fulltekst',
        },
      ],
    },
    {
      id: 'sjo_nmg',
      groupid: 14,
      name: {
        nb: 'Norges maritime grenser',
        nn: 'Noregs maritime grenser',
        en: "Norway's maritime borders",
      },
      wmsUrl: 'https://wms.geonorge.no/skwms1/wms.nmg',
      infoFormat: 'text/plain',
      parentId: 'sjo',
    },
  ],
  layers: [
    // --- Dybdedatakvalitet layers ---
    {
      id: 'sjoDybdedatakvalitetSjokart',
      name: {
        nb: 'Dybdedatakvalitet sjøkart',
        nn: 'Djupdatakvalitet sjøkart',
        en: 'Depth data quality nautical chart',
      },
      layers: 'Dybdedatakvalitet_sjokart',
      categoryId: 'sjo_dybdedatakvalitet',
      groupid: 14,
      queryable: false,
      useLegendGraphic: true,
    },
    {
      id: 'sjoIkkeSjomalt',
      name: {
        nb: 'Ikke sjømålt',
        nn: 'Ikkje sjømålt',
        en: 'Not surveyed',
      },
      layers: 'IkkeSjomalt',
      categoryId: 'sjo_dybdedatakvalitet',
      groupid: 14,
      queryable: false,
      useLegendGraphic: true,
    },

    // --- Farlige bølger layers ---
    {
      id: 'sjoFarligeBolger',
      name: {
        nb: 'Farlige bølger',
        nn: 'Farlege bølgjer',
        en: 'Dangerous waves',
      },
      layers: 'Farlige_bolger',
      categoryId: 'sjo_farlige_bolger',
      groupid: 14,
      queryable: true,
      useLegendGraphic: true,
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
      groupid: 14,
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
