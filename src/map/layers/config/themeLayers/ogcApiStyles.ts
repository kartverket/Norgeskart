import { ThemeLayerConfig } from '../../themeLayerConfigApi';

// Demo: styles published through OGC API - Styles on the OGC-API-frontend
// reference implementation (kartverket/OGC-API-frontend). Only a dev
// deployment exists; style JSON lives in that repo's
// pygeoapi/resources/definitions/styles/
// VITE_OGC_API_URL points the demo at a local stack (http://localhost:5001)
const OGC_API_URL =
  import.meta.env.VITE_OGC_API_URL ??
  'https://api.datadeling-ogcapi.atgcp1-dev.kartverket.cloud';

// Rendered on the collection's tileset in the map CRS when the API has one
// (EPSG25833Quad); otherwise on WebMercatorQuad, reprojected per tile

export const ogcApiStylesConfig: ThemeLayerConfig = {
  categories: [
    {
      id: 'ogcApiStyles',
      groupid: 3,
      name: {
        nb: 'OGC API-stiler (demo)',
        nn: 'OGC API-stilar (demo)',
        en: 'OGC API styles (demo)',
      },
    },
  ],
  layers: [
    {
      id: 'ogcStyleKommunerDefault',
      name: {
        nb: 'Kommuner – standard',
        nn: 'Kommunar – standard',
        en: 'Municipalities – default',
      },
      type: 'ogcStyle',
      ogcApiUrl: OGC_API_URL,
      ogcCollection: 'kommuner',
      // ogcStyleId unset → the collection's server-side default style
      categoryId: 'ogcApiStyles',
      groupid: 3,
      noLegend: true,
    },
    {
      id: 'ogcStyleKommunerRed',
      name: {
        nb: 'Kommuner – med navn, rød',
        nn: 'Kommunar – med namn, raud',
        en: 'Municipalities – with names, red',
      },
      type: 'ogcStyle',
      ogcApiUrl: OGC_API_URL,
      ogcCollection: 'kommuner',
      ogcStyleId: 'Med kommunenavn - rød',
      categoryId: 'ogcApiStyles',
      groupid: 3,
      noLegend: true,
    },
    {
      id: 'ogcStyleFylkerDefault',
      name: {
        nb: 'Fylker – standard',
        nn: 'Fylke – standard',
        en: 'Counties – default',
      },
      type: 'ogcStyle',
      ogcApiUrl: OGC_API_URL,
      ogcCollection: 'fylker',
      categoryId: 'ogcApiStyles',
      groupid: 3,
      noLegend: true,
    },
  ],
};
