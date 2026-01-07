import { ThemeLayerConfig } from '../../../api/themeLayerConfigApi';

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
          name: 'punktnummer',
          alias: 'Punktnummer',
        },
        {
          name: 'punktnavn',
          alias: 'Punktnavn',
        },
        {
          name: 'nord',
          alias: 'Nord',
        },
        {
          name: 'ost',
          alias: 'Øst',
        },
        {
          name: 'sone',
          alias: 'Sone',
        },
        {
          name: 'hoyde_nn2000',
          alias: 'Høyde NN2000',
          unit: 'm',
        },
        {
          name: 'hoyde_nn1954',
          alias: 'Høyde NN1954',
          unit: 'm',
        },
        {
          name: 'ellipsoidisk_hoyde',
          alias: 'Ellipsoidisk høyde',
        },
        {
          name: 'punkttype',
          alias: 'Punkttype',
        },
        {
          name: 'underlag',
          alias: 'Underlag',
        },
        {
          name: 'kvalitet_nn1954',
          alias: 'Kvalitet NN1954',
          unit: 'mm',
        },
        {
          name: 'kvalitet_nn2000',
          alias: 'Kvalitet NN2000',
          unit: 'mm',
        },
        {
          name: 'kvalitet_grunnriss',
          alias: 'Kvalitet grunnriss',
          unit: 'mm',
        },
        {
          name: 'status',
          alias: 'Status',
        },
        {
          name: 'status_ar',
          alias: 'Status år',
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
      legacyId: '1015',
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
      legacyId: '1016',
      queryable: true,
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
      legacyId: '1017',
      queryable: true,
    },
    {
      id: 'nivBenchmarks',
      name: {
        nb: 'Niv. fastmerker',
        nn: 'Niv. fastmerke',
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
        nn: 'Landsnettspunkt',
        en: 'National network points',
      },
      layers: 'Landsnettpunkt',
      categoryId: 'benchmarks',
      groupid: 13,
      legacyId: '1012',
      queryable: true,
      useLegendGraphic: true,
    },
    {
      id: 'primaryNetPoints',
      name: {
        nb: 'Stamnettpunkter',
        nn: 'Stamnettspunkt',
        en: 'Primary network points',
      },
      layers: 'Stamnettpunkt',
      categoryId: 'benchmarks',
      groupid: 13,
      legacyId: '1013',
      queryable: true,
      useLegendGraphic: true,
    },
    {
      id: 'triangulationPoints',
      name: {
        nb: 'Trekantpunkter',
        nn: 'Trekantspunkt',
        en: 'Triangulation points',
      },
      layers: 'Trekantpunkt',
      categoryId: 'benchmarks',
      groupid: 13,
      legacyId: '1014',
      queryable: true,
      useLegendGraphic: true,
    },
  ],
};
