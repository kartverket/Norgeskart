import { FieldConfig, ThemeLayerConfig } from '../../themeLayerConfigApi';

// Only what a user needs to order the sheet from a dealer. Projection, datum and
// the static edition stamp ('u') are left out: POD sheets are printed current.
const seaChartFields: FieldConfig[] = [
  { name: 'n', alias: 'Kartnummer' },
  { name: 'name', alias: 'Navn' },
  { name: 's', alias: 'Målestokk', type: 'scale' },
];

const n50Fields: FieldConfig[] = [{ name: 'n', alias: 'Kartbladnummer' }];

export const dekningConfig: ThemeLayerConfig = {
  categories: [
    {
      id: 'dekning',
      groupid: 18,
      name: {
        nb: 'Kartbladoversikt',
        nn: 'Kartbladoversikt',
        en: 'Map sheet overview',
      },
      // Kartverket sells no paper maps; dealers print sheets on demand.
      featureInfoLink: {
        label: {
          nb: 'Slik bestiller du kartet',
          nn: 'Slik bestiller du kartet',
          en: 'How to order this map',
        },
        url: {
          nb: 'https://kartverket.no/sider/bestille-kart',
          nn: 'https://kartverket.no/sider/bestille-kart',
          en: 'https://kartverket.no/en/pages/where-to-order-maps',
        },
      },
    },
  ],
  layers: [
    {
      id: 'hovedkart_sjo',
      name: {
        nb: 'Hovedkart sjø',
        nn: 'Hovudkart sjø',
        en: 'Main nautical chart',
      },
      type: 'geojson',
      geojsonUrl: '/json/dekning/sjo/hovedserie_ny.json',
      categoryId: 'dekning',
      groupid: 18,
      legacyId: 'dekning.8011',
      queryable: false,
      noLegend: true,
      featureInfoFields: seaChartFields,
      style: {
        fill: {
          color: 'rgba(51, 153, 204, 0.2)',
        },
        stroke: {
          color: '#3399cc',
          width: 2,
        },
        text: {
          property: 'n',
          scale: 1.2,
          fill: {
            color: '#000000',
          },
          stroke: {
            color: '#ffffff',
            width: 3,
          },
        },
      },
    },
    {
      id: 'norge_1_50000',
      name: {
        nb: 'Norge 1:50 000',
        nn: 'Norge 1:50 000',
        en: 'Norway 1:50,000',
      },
      type: 'geojson',
      geojsonUrl: '/json/dekning/land/n50/n50_pod_inndeling2025.json',
      sourceEpsg: 'EPSG:25833',
      categoryId: 'dekning',
      groupid: 18,
      legacyId: 'dekning.8012',
      queryable: false,
      noLegend: true,
      featureInfoFields: n50Fields,
      style: {
        fill: {
          color: 'rgba(102, 178, 102, 0.2)',
        },
        stroke: {
          color: '#66b266',
          width: 2,
        },
        text: {
          property: 'n',
          scale: 1.2,
          fill: {
            color: '#000000',
          },
          stroke: {
            color: '#ffffff',
            width: 3,
          },
        },
      },
    },
    {
      id: 'overseilingskart',
      name: {
        nb: 'Overseilingskart',
        nn: 'Overseglingskart',
        en: 'General nautical chart',
      },
      type: 'geojson',
      geojsonUrl: '/json/dekning/sjo/overseilingskart_ny.json',
      categoryId: 'dekning',
      groupid: 18,
      legacyId: 'dekning.8013',
      queryable: false,
      noLegend: true,
      featureInfoFields: seaChartFields,
      style: {
        fill: {
          color: 'rgba(204, 153, 51, 0.2)',
        },
        stroke: {
          color: '#cc9933',
          width: 2,
        },
        text: {
          property: 'n',
          scale: 1.2,
          fill: {
            color: '#000000',
          },
          stroke: {
            color: '#ffffff',
            width: 3,
          },
        },
      },
    },
    {
      id: 'kystkart',
      name: {
        nb: 'Kystkart',
        nn: 'Kystkart',
        en: 'Coastal nautical chart',
      },
      type: 'geojson',
      geojsonUrl: '/json/dekning/sjo/kystkart_ny.json',
      categoryId: 'dekning',
      groupid: 18,
      legacyId: 'dekning.8014',
      queryable: false,
      noLegend: true,
      featureInfoFields: seaChartFields,
      style: {
        fill: {
          color: 'rgba(153, 102, 204, 0.2)',
        },
        stroke: {
          color: '#9966cc',
          width: 2,
        },
        text: {
          property: 'n',
          scale: 1.2,
          fill: {
            color: '#000000',
          },
          stroke: {
            color: '#ffffff',
            width: 3,
          },
        },
      },
    },
    {
      id: 'havnekart',
      name: {
        nb: 'Havnekart',
        nn: 'Hamnekart',
        en: 'Harbour chart',
      },
      type: 'geojson',
      geojsonUrl: '/json/dekning/sjo/havnekart_ny.json',
      categoryId: 'dekning',
      groupid: 18,
      legacyId: 'dekning.8015',
      queryable: false,
      noLegend: true,
      featureInfoFields: seaChartFields,
      style: {
        fill: {
          color: 'rgba(204, 51, 102, 0.2)',
        },
        stroke: {
          color: '#cc3366',
          width: 2,
        },
        text: {
          property: 'n',
          scale: 1.2,
          fill: {
            color: '#000000',
          },
          stroke: {
            color: '#ffffff',
            width: 3,
          },
        },
      },
    },
    {
      id: 'svalbardkart_sjo',
      name: {
        nb: 'Svalbardkart sjø',
        nn: 'Svalbardkart sjø',
        en: 'Svalbard nautical chart',
      },
      type: 'geojson',
      geojsonUrl: '/json/dekning/sjo/svalbardkart_ny.json',
      categoryId: 'dekning',
      groupid: 18,
      legacyId: 'dekning.8016',
      queryable: false,
      noLegend: true,
      featureInfoFields: seaChartFields,
      style: {
        fill: {
          color: 'rgba(102, 178, 204, 0.2)',
        },
        stroke: {
          color: '#66b2cc',
          width: 2,
        },
        text: {
          property: 'n',
          scale: 1.2,
          fill: {
            color: '#000000',
          },
          stroke: {
            color: '#ffffff',
            width: 3,
          },
        },
      },
    },
  ],
};
