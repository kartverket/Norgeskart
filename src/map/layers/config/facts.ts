import { ThemeLayerConfig } from '../../../api/themeLayerConfigApi';

export const factsConfig: ThemeLayerConfig = {
  categories: [
    {
      id: 'facts',
      groupid: 3,
      name: {
        nb: 'Fakta',
        nn: 'Fakta',
        en: 'Facts',
      },
      wmsUrl: 'https://wms.geonorge.no/skwms1/wms.markagrensen',
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
      categoryId: 'facts',
      groupid: 3,
      legacyId: '1026',
      queryable: false,
    },
  ],
};
