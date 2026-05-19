import { ThemeLayerConfig } from '../../../api/themeLayerConfigApi';

const BASE_URL =
  'https://api.datadeling-ogcapi.atgcp1-dev.kartverket.cloud/collections';

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
      // kystkontur variant clips boundaries to the coastal contour — cleaner
      // visual result on both land and nautical maps
      geojsonUrl: `${BASE_URL}/fylker_kystkontur/items?f=json&limit=50`,
      sourceEpsg: 'EPSG:4326',
      // Style translated from SLD (Fylkesgrense, LineSymbolizer):
      // https://register.geonorge.no/kartografi/files/Details?SystemId=ea4a3747-abd3-490d-b1ff-fd17e88cd2f1
      style: {
        fill: {
          color: 'rgba(0, 0, 0, 0)',
        },
        stroke: {
          color: '#2a2a3b',
          width: 1,
        },
        text: {
          property: 'navn',
          scale: 1.2,
          fill: { color: '#2a2a3b' },
          stroke: { color: '#ffffff', width: 3 },
        },
      },
      categoryId: 'ogcApiFylker',
      groupid: 3,
      noLegend: true,
    },
    {
      id: 'ogcApiFylkerKystkonturLayer',
      name: {
        nb: 'Fylker (kystkontur)',
        nn: 'Fylke (kystkontur)',
        en: 'Counties (coastal outline)',
      },
      type: 'geojson',
      geojsonUrl: `${BASE_URL}/fylker_kystkontur/items?f=json&limit=50`,
      sourceEpsg: 'EPSG:4326',
      style: {
        fill: {
          color: 'rgba(42, 42, 59, 0.05)',
        },
        stroke: {
          color: '#2a2a3b',
          width: 2,
        },
        text: {
          property: 'navn',
          scale: 1.2,
          fill: { color: '#2a2a3b' },
          stroke: { color: '#ffffff', width: 3 },
        },
      },
      categoryId: 'ogcApiFylker',
      groupid: 3,
      noLegend: true,
    },
  ],
};
