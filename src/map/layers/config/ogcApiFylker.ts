import { ThemeLayerConfig } from '../../../api/themeLayerConfigApi';

export const ogcApiFylkerConfig: ThemeLayerConfig = {
  categories: [
    {
      id: 'ogcApiFylker',
      groupid: 3,
      name: {
        nb: 'Fylker (OGC API)',
        nn: 'Fylke (OGC API)',
        en: 'Counties (OGC API)',
      },
    },
  ],
  layers: [
    {
      id: 'ogcApiFylkerLayer',
      name: {
        nb: 'Fylker',
        nn: 'Fylke',
        en: 'Counties',
      },
      type: 'geojson',
      geojsonUrl:
        'https://api.datadeling-ogcapi.atgcp1-dev.kartverket.cloud/collections/fylker/items?f=json&limit=15',
      sourceEpsg: 'EPSG:4326',
      style: {
        fill: {
          color: 'rgba(255, 165, 0, 0.15)',
        },
        stroke: {
          color: 'rgba(255, 120, 0, 0.9)',
          width: 2,
        },
        text: {
          property: 'navn',
          scale: 1.2,
          fill: { color: '#333333' },
          stroke: { color: '#FFFFFF', width: 3 },
        },
      },
      categoryId: 'ogcApiFylker',
      groupid: 3,
      noLegend: true,
    },
  ],
};
