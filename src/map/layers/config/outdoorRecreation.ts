import { ThemeLayerConfig } from '../../../api/themeLayerConfigApi';

export const outdoorRecreationLayerConfig: ThemeLayerConfig = {
  categories: [
    {
      id: 'outdoorRecreation',
      groupid: 5,
      name: {
        nb: 'Tur og friluftsruter',
        nn: 'Tur og friluftsruter',
        en: 'Hiking and outdoor routes',
      },
      wmsUrl: 'https://wms.geonorge.no/skwms1/wms.friluftsruter2',
    },
  ],
  layers: [
    {
      id: 'hikingTrails',
      name: {
        nb: 'Fotruter',
        nn: 'Fotruter',
        en: 'Hiking trails',
      },
      layers: 'Fotrute',
      categoryId: 'outdoorRecreation',
      groupid: 5,
      legacyId: '5.Fotrute',
      queryable: true,
    },
    {
      id: 'routeInfoPoints',
      name: {
        nb: 'Ruteinfopunkt',
        nn: 'Ruteinfopunkt',
        en: 'Route info points',
      },
      layers: 'Ruteinfopunkt',
      categoryId: 'outdoorRecreation',
      groupid: 5,
      legacyId: '5.Fotrute',
      queryable: true,
      useLegendGraphic: true,
    },
    {
      id: 'skiingTrails',
      name: {
        nb: 'Skiløyper',
        nn: 'Skiløyper',
        en: 'Ski trails',
      },
      layers: 'Skiloype',
      categoryId: 'outdoorRecreation',
      groupid: 5,
      legacyId: '5.Skiloype',
      queryable: true,
    },
    {
      id: 'bikeTrails',
      name: {
        nb: 'Sykkelruter',
        nn: 'Sykkelruter',
        en: 'Bike trails',
      },
      layers: 'Sykkelrute',
      categoryId: 'outdoorRecreation',
      groupid: 5,
      legacyId: '5.Sykkelrute',
      queryable: true,
    },
    {
      id: 'waterTrails',
      name: {
        nb: 'Andre ruter',
        nn: 'Andre ruter',
        en: 'Other routes',
      },
      layers: 'AnnenRute',
      categoryId: 'outdoorRecreation',
      groupid: 5,
      legacyId: '5.AnnenRute',
      queryable: true,
    },
  ],
};
