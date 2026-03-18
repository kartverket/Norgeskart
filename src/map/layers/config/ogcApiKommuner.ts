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
      // Style translated from SLD (Kommuner, PolygonSymbolizer):
      // https://register.geonorge.no/kartografi/files/Details?SystemId=ca6c1dc8-b3d5-431b-a7c1-3425a87c38a2
      //
      // SLD mapping:
      //   se:SvgParameter name="stroke" #8a3e4e  → stroke.color
      //   se:SvgParameter name="stroke-width" 2  → stroke.width
      //   No <se:Fill> in SLD                    → fill transparent (rgba(0,0,0,0))
      //   No TextSymbolizer in SLD               → no text block
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
  ],
};
