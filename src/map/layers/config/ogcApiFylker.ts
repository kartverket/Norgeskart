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
      // Style translated from SLD (Fylkesgrense, LineSymbolizer):
      // https://register.geonorge.no/kartografi/files/Details?SystemId=ea4a3747-abd3-490d-b1ff-fd17e88cd2f1
      //
      // SLD mapping:
      //   se:SvgParameter name="stroke" #2a2a3b  → stroke.color
      //   se:SvgParameter name="stroke-width" 1  → stroke.width
      //   No <se:Fill> in SLD                    → fill transparent (rgba(0,0,0,0))
      //   No TextSymbolizer in SLD               → no text block
      style: {
        fill: {
          color: 'rgba(0, 0, 0, 0)',
        },
        stroke: {
          color: '#2a2a3b',
          width: 1,
        },
      },
      categoryId: 'ogcApiFylker',
      groupid: 3,
      noLegend: true,
    },
  ],
};
