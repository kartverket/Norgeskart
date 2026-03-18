import { ThemeLayerConfig } from '../../../api/themeLayerConfigApi';

export const ogcApiKommunerConfig: ThemeLayerConfig = {
  categories: [
    {
      id: 'ogcApiKommuner',
      groupid: 3,
      name: {
        nb: 'Kommuner (OGC API)',
        nn: 'Kommunar (OGC API)',
        en: 'Municipalities (OGC API)',
      },
    },
  ],
  layers: [
    {
      id: 'ogcApiKommunerLayer',
      name: {
        nb: 'Kommuner',
        nn: 'Kommunar',
        en: 'Municipalities',
      },
      type: 'geojson',
      geojsonUrl:
        'https://api.datadeling-ogcapi.atgcp1-dev.kartverket.cloud/collections/kommuner/items?f=json&limit=500',
      sourceEpsg: 'EPSG:4326',
      style: {
        fill: {
          color: 'rgba(0, 128, 255, 0.1)',
        },
        stroke: {
          color: 'rgba(0, 80, 200, 0.9)',
          width: 1.5,
        },
        text: {
          property: 'navn',
          scale: 1.0,
          fill: { color: '#333333' },
          stroke: { color: '#FFFFFF', width: 3 },
        },
      },
      categoryId: 'ogcApiKommuner',
      groupid: 3,
      noLegend: true,
    },
  ],
};
