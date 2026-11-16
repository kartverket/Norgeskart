import { ThemeLayerConfig } from '../../themeLayerConfigApi';

export const propertyInfoConfig: ThemeLayerConfig = {
  categories: [
    {
      id: 'propertyInfo',
      groupid: 30,
      name: {
        nb: 'Eiendom',
        nn: 'Eigedom',
        en: 'Properties',
      },
    },
    {
      id: 'cadastralData',
      groupid: 31,
      name: {
        nb: 'Velg matrikkeldata',
        nn: 'Vel matrikkeldata',
        en: 'Select cadastral data',
      },
      parentId: 'propertyInfo',
      wmsUrl: 'https://api.norgeskart.no/v1/matrikkel/wms',
    },
  ],
  layers: [
    {
      id: 'addresses',
      name: {
        nb: 'Adresser',
        nn: 'Adresser',
        en: 'Addresses',
      },
      layers: 'matrikkel:MATRIKKELADRESSEWFS,matrikkel:VEGADRESSEWFS',
      categoryId: 'cadastralData',
      groupid: 31,
      legacyId: 'seeiendom.1011',
      queryable: true,
      // matrikkel GeoServer has no GetStyles operation; use GetLegendGraphic
      useLegendGraphic: true,
      singleImage: true,
    },
    {
      id: 'buildings',
      name: {
        nb: 'Bygninger',
        nn: 'Bygningar',
        en: 'Buildings',
      },
      layers: 'matrikkel:BYGNINGWFS',
      categoryId: 'cadastralData',
      groupid: 31,
      legacyId: 'seeiendom.1012',
      queryable: true,
      useLegendGraphic: true,
      singleImage: true,
      filter: `
        <Filter xmlns="http://www.opengis.net/ogc">
          <Or>
            <PropertyIsLessThan>
              <PropertyName>BYGNINGSTATUS</PropertyName>
              <Literal>9</Literal>
            </PropertyIsLessThan>
            <PropertyIsEqualTo>
              <PropertyName>BYGNINGSTATUS</PropertyName>
              <Literal>13</Literal>
            </PropertyIsEqualTo>
          </Or>
        </Filter>`.trim(),
    },
    {
      id: 'borders',
      name: {
        nb: 'Teiger og grenser',
        nn: 'Teigar og grenser',
        en: 'Plots and borders',
      },
      layers: 'matrikkel:TEIGGRENSEWFS,matrikkel:TEIGWFS',
      categoryId: 'cadastralData',
      groupid: 31,
      legacyId: 'seeiendom.1013',
      queryable: true,
      styles: ',Matrikkelnummer',
      // matrikkel GeoServer has no GetStyles operation; use GetLegendGraphic.
      // Legend shows default styles (STYLE is not passed to GetLegendGraphic).
      useLegendGraphic: true,
      singleImage: true,
    },
  ],
};
