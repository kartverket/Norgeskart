import { ThemeLayerConfig } from '../../themeLayerConfigApi';

export const fastmerkerLayerConfig: ThemeLayerConfig = {
  categories: [
    {
      id: 'fastmerker',
      groupid: 13,
      name: {
        nb: 'Fastmerker',
        nn: 'Fastmerke',
        en: 'Reference marks',
      },
      wmsUrl: 'https://wms.geonorge.no/skwms1/wms.fastmerker2',
    },
    {
      id: 'benchmarks',
      groupid: 13,
      name: {
        nb: 'Fastmerker',
        nn: 'Fastmerke',
        en: 'Benchmarks',
      },
      wmsUrl: 'https://wms.geonorge.no/skwms1/wms.fastmerker2',
      parentId: 'fastmerker',
      featureInfoFields: [
        {
          name: 'punkttype',
          alias: 'Punkttype',
        },
        {
          name: 'punktnavn',
          alias: 'Punktnavn',
        },
        {
          name: 'punktnummer',
          alias: 'Punktnummer',
        },
        {
          name: 'nord',
          alias: 'Nord',
          decimals: 3,
        },
        {
          name: 'ost',
          alias: 'Øst',
          decimals: 3,
        },
        {
          name: 'sone',
          alias: 'Sone',
        },
        {
          name: 'kvalitet_grunnriss',
          alias: 'Kvalitet grunnriss',
          unit: 'mm',
        },
        {
          name: 'hoyde_nn2000',
          alias: 'Høyde NN2000',
          unit: 'm',
          decimals: 3,
        },
        {
          name: 'kvalitet_nn2000',
          alias: 'Kvalitet NN2000',
          unit: 'mm',
        },
        {
          name: 'underlag',
          alias: 'Underlag',
        },
        {
          name: 'hoyde_nn1954',
          alias: 'Høyde NN1954',
          unit: 'm',
          decimals: 3,
        },
        {
          name: 'kvalitet_nn1954',
          alias: 'Kvalitet NN1954',
          unit: 'mm',
        },
        {
          name: 'beskrivelse',
          alias: 'Beskrivelse',
        },
      ],
    },
    {
      id: 'baseStations',
      groupid: 14,
      name: {
        nb: 'Basestasjoner',
        nn: 'Basestasjonar',
        en: 'Base stations',
      },
      wmsUrl: 'https://wms.geonorge.no/skwms1/wms.fastmerker2',
      parentId: 'fastmerker',
      featureInfoFields: [
        {
          name: 'sitename',
          alias: 'Stasjonsnavn',
        },
        {
          name: 'fourcharid',
          alias: 'StasjonsId',
        },
        {
          name: 'siteconfigstattypename',
          alias: 'Status',
        },
      ],
    },
    {
      id: 'utmGrid',
      groupid: 15,
      name: {
        nb: 'UTM-rutenett',
        nn: 'UTM-rutenett',
        en: 'UTM grid',
      },
      wmsUrl: 'https://wms.geonorge.no/skwms1/wms.rutenett',
      parentId: 'fastmerker',
    },
  ],
  layers: [
    {
      id: 'utmGrid',
      name: {
        nb: 'UTM-rutenett',
        nn: 'UTM-rutenett',
        en: 'UTM grid',
      },
      layers: 'UTMrutenett',
      categoryId: 'utmGrid',
      groupid: 15,
      legacyId: 'Fastmerker.1015',
      queryable: false,
    },
    {
      id: 'norwegianBaseStations',
      name: {
        nb: 'Norske basestasjoner',
        nn: 'Norske basestasjonar',
        en: 'Norwegian base stations',
      },
      layers: 'Stasjoner',
      categoryId: 'baseStations',
      groupid: 14,
      legacyId: 'Fastmerker.1016',
      queryable: true,
      useLegendGraphic: true,
    },
    {
      id: 'swedishFinnishBaseStations',
      name: {
        nb: 'Svenske og finske basestasjoner',
        nn: 'Svenske og finske basestasjonar',
        en: 'Swedish and Finnish base stations',
      },
      layers: 'Svenske_finske_stasjoner',
      categoryId: 'baseStations',
      groupid: 14,
      legacyId: 'Fastmerker.1017',
      queryable: true,
      useLegendGraphic: true,
    },
    {
      id: 'nivBenchmarks',
      name: {
        nb: 'Nivellementsfastmerker',
        nn: 'Nivellementsfastmerke',
        en: 'Height benchmarks',
      },
      layers: 'Niv_fastmerker',
      categoryId: 'benchmarks',
      groupid: 13,
      legacyId: '1011',
      queryable: true,
    },
    {
      id: 'landNetPoints',
      name: {
        nb: 'Landsnettpunkter',
        nn: 'Landsnettpunkt',
        en: 'National network points',
      },
      layers: 'Landsnettpunkt',
      categoryId: 'benchmarks',
      groupid: 13,
      legacyId: 'Fastmerker.1012',
      queryable: true,
      useLegendGraphic: true,
    },
    {
      id: 'primaryNetPoints',
      name: {
        nb: 'Stamnettpunkter',
        nn: 'Stamnettpunkt',
        en: 'Primary network points',
      },
      layers: 'Stamnettpunkt',
      categoryId: 'benchmarks',
      groupid: 13,
      legacyId: 'Fastmerker.1013',
      queryable: true,
      useLegendGraphic: true,
    },
    {
      id: 'triangulationPoints',
      name: {
        nb: 'Trekantpunkter',
        nn: 'Trekantpunkt',
        en: 'Triangulation points',
      },
      layers: 'Trekantpunkt',
      categoryId: 'benchmarks',
      groupid: 13,
      legacyId: 'Fastmerker.1014',
      queryable: true,
      useLegendGraphic: true,
    },
  ],
};
