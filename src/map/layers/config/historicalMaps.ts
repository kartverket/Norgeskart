import { ThemeLayerConfig } from '../../../api/themeLayerConfigApi';

export const historicalMapsConfig: ThemeLayerConfig = {
  categories: [
    {
      id: 'historicalMaps',
      groupid: 20,
      name: {
        nb: 'Historiske kart',
        nn: 'Historiske kart',
        en: 'Historical Maps',
      },
    },
  ],
  layers: [
    {
      id: 'economicMapFirstEdition',
      name: {
        nb: 'Økonomisk Kartverket 1. utgave',
        nn: 'Økonomisk kartverk 1. utgåve',
        en: 'Economic chart 1st edition',
      },
      layers: 'n5raster_foerstegang_metadata,n5raster_foerstegang',
      categoryId: 'historicalMaps',
      groupid: 20,
      legacyId: '1011',
      queryable: true,
      wmsUrl: 'https://wms.geonorge.no/skwms1/wms.n5raster2',
    },
    {
      id: 'amtMap',
      name: {
        nb: 'Amtskart',
        nn: 'Amtskart',
        en: 'Amt charts',
      },
      layers: 'amt1',
      categoryId: 'historicalMaps',
      groupid: 20,
      legacyId: '1012',
      queryable: false,
      wmsUrl: 'https://wms.geonorge.no/skwms1/wms.historiskekart',
    },
  ],
};
