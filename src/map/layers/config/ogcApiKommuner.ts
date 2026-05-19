import { ThemeLayerConfig } from '../../../api/themeLayerConfigApi';

const BASE_URL =
  'https://api.datadeling-ogcapi.atgcp1-dev.kartverket.cloud/collections';

// OGC API Tiles template: {tileMatrix}/{tileRow}/{tileCol} maps to OL's {z}/{y}/{x}
const MVT_TEMPLATE = (collection: string) =>
  `${BASE_URL}/${collection}/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt`;

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
      // MVT tiles: only loads tiles covering the current viewport and
      // simplifies geometry per zoom level — far more efficient than
      // downloading all 356 municipality polygons at once as GeoJSON
      type: 'mvt',
      mvtUrl: MVT_TEMPLATE('kommuner_kystkontur'),
      // Style translated from SLD (Kommuner, PolygonSymbolizer):
      // https://register.geonorge.no/kartografi/files/Details?SystemId=ca6c1dc8-b3d5-431b-a7c1-3425a87c38a2
      style: {
        fill: {
          color: 'rgba(0, 0, 0, 0)',
        },
        stroke: {
          color: '#8a3e4e',
          width: 2,
        },
      },
      categoryId: 'ogcApiKommuner',
      groupid: 3,
      noLegend: true,
    },
    {
      id: 'ogcApiKommunerKystkonturLayer',
      name: {
        nb: 'Kommuner (kystkontur)',
        nn: 'Kommunar (kystkontur)',
        en: 'Municipalities (coastal outline)',
      },
      type: 'mvt',
      mvtUrl: MVT_TEMPLATE('kommuner_kystkontur'),
      style: {
        fill: {
          color: 'rgba(138, 62, 78, 0.05)',
        },
        stroke: {
          color: '#8a3e4e',
          width: 2,
        },
        text: {
          property: 'navn',
          scale: 1.0,
          fill: { color: '#8a3e4e' },
          stroke: { color: '#ffffff', width: 3 },
        },
      },
      categoryId: 'ogcApiKommuner',
      groupid: 3,
      noLegend: true,
    },
  ],
};
