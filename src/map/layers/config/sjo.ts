import { ThemeLayerConfig } from '../../../api/themeLayerConfigApi';

export const sjoConfig: ThemeLayerConfig = {
  categories: [
    {
      id: 'sjo',
      groupid: 14,
      name: {
        nb: 'Til sjøs',
        nn: 'Til sjøs',
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
  ],
};
