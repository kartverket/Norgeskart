import { ThemeLayerConfig } from '../../../api/themeLayerConfigApi';

export const placeNamesConfig: ThemeLayerConfig = {
  categories: [
    {
      id: 'placeNames',
      groupid: 2,
      name: {
        nb: 'Stedsnavn',
        nn: 'Stadsnamn',
        en: 'Place Names',
      },
    },
  ],
  layers: [
    {
      id: 'ecoKvFirst',
      name: {
        nb: 'Økonomisk Kartverket 1. utgave',
        nn: 'Økonomisk kartverk 1. utgåve',
        en: 'Economic chart 1st edition',
      },
      layers: 'n5raster_foerstegang_metadata,n5raster_foerstegang',
      categoryId: 'placeNames',
      groupid: 2,
      legacyId: '1011',
      queryable: true,
      wmsUrl: 'https://wms.geonorge.no/skwms1/wms.n5raster2',
    },
    {
      id: 'amtCharts',
      name: {
        nb: 'Amtskart',
        nn: 'Amtskart',
        en: 'Amt charts',
      },
      layers: 'amt1',
      categoryId: 'placeNames',
      groupid: 2,
      legacyId: '1012',
      queryable: false,
      wmsUrl: 'https://wms.geonorge.no/skwms1/wms.historiskekart',
    },
  ],
};
