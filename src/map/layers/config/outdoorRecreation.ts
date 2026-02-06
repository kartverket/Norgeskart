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
      legacyId: '1011',
      queryable: true,
      filter: `
        <Filter xmlns="http://www.opengis.net/ogc">
          <PropertyIsEqualTo>
            <PropertyName>merking_d</PropertyName>
            <Literal>Merket</Literal>
          </PropertyIsEqualTo>
        </Filter>`.trim(),
    },
    {
      id: 'hikingTrailsUnmarked',
      name: {
        nb: 'Umerkede fotruter',
        nn: 'Umerka fotruter',
        en: 'Unmarked hiking trails',
      },
      layers: 'Fotrute',
      categoryId: 'outdoorRecreation',
      groupid: 5,
      queryable: true,
      filter: `
        <Filter xmlns="http://www.opengis.net/ogc">
          <PropertyIsEqualTo>
            <PropertyName>merking_d</PropertyName>
            <Literal>Ikke merket</Literal>
          </PropertyIsEqualTo>
        </Filter>`.trim(),
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
      legacyId: '1012',
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
      legacyId: '1013',
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
      legacyId: '1014',
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
      legacyId: '1015',
      queryable: true,
    },
  ],
};
