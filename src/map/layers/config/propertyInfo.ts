import { ThemeLayerConfig } from '../../../api/themeLayerConfigApi';

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
      wmsUrl: 'https://testapi.norgeskart.no/v1/matrikkel/wms',
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
      legacyId: '1011',
      queryable: true,
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
      legacyId: '1012',
      queryable: true,
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
      legacyId: '1013',
      queryable: true,
      styles: ',Matrikkelnummer',
      SLD_BODY: `<?xml version="1.0" encoding="UTF-8"?>
<sld:StyledLayerDescriptor version="1.0.0" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc">
  <sld:NamedLayer>
    <sld:Name>matrikkel:TEIGGRENSEWFS</sld:Name>
    <sld:UserStyle>
      <sld:FeatureTypeStyle>
        <sld:Rule>
          <sld:LineSymbolizer>
            <sld:Stroke>
              <sld:CssParameter name="stroke-width">1</sld:CssParameter>
            </sld:Stroke>
          </sld:LineSymbolizer>
        </sld:Rule>
      </sld:FeatureTypeStyle>
    </sld:UserStyle>
  </sld:NamedLayer>
  <sld:NamedLayer>
    <sld:Name>matrikkel:TEIGWFS</sld:Name>
    <sld:UserStyle>
      <sld:FeatureTypeStyle>
        <sld:Rule>
          <sld:PolygonSymbolizer>
            <sld:Stroke>
              <sld:CssParameter name="stroke-width">2</sld:CssParameter>
            </sld:Stroke>
          </sld:PolygonSymbolizer>
        </sld:Rule>
      </sld:FeatureTypeStyle>
    </sld:UserStyle>    
  </sld:NamedLayer>
</sld:StyledLayerDescriptor>`,
    },
  ],
};
