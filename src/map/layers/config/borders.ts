import { ThemeLayerConfig } from '../../../api/themeLayerConfigApi';
import { getEnv } from '../../../env';
const env = getEnv();

export const borderConfig: ThemeLayerConfig = {
  categories: [
    {
      id: 'borders',
      groupid: 3,
      name: {
        nb: 'Grenser',
        nn: 'Grenser',
        en: 'Brorders',
      },
    },
  ],
  layers: [
    {
      id: 'osloMarkaBorder',
      name: {
        nb: 'Markagrensen',
        nn: 'Markagrensa',
        en: 'Oslo Marka border',
      },
      layers: 'Markagrensen',
      categoryId: 'borders',
      wmsUrl: env.layerProviderParameters.geoNorgeWMS.baseUrl + '.markagrensen',
      groupid: 3,
      legacyId: '1026',
      queryable: false,
    },
    {
      id: 'countyBorders',
      name: {
        nb: 'Fylkesgrenser',
        nn: 'Fylkesgrenser',
        en: 'County borders',
      },
      layers: 'fylker',
      categoryId: 'borders',
      wmsUrl: env.layerProviderParameters.geoNorgeWMS.baseUrl + '.adm_enheter2',
      groupid: 3,
      queryable: false,
    },
    {
      id: 'municipalityBorders',
      name: {
        nb: 'Kommunegrenser',
        nn: 'Kommunegrenser',
        en: 'Municipality borders',
      },
      layers: 'kommuner',
      categoryId: 'borders',
      wmsUrl: env.layerProviderParameters.geoNorgeWMS.baseUrl + '.adm_enheter2',
      groupid: 3,
      queryable: false,
    },
    {
      id: 'maritimeBorders',
      name: {
        nb: 'Norges maritime grense',
        nn: 'Noregs maritime grense',
        en: 'Norwegian maritime border',
      },
      layers: 'Maritime_grenser,Maritime_grenser_navn',
      categoryId: 'borders',
      wmsUrl: env.layerProviderParameters.geoNorgeWMS.baseUrl + '.nmg',
      groupid: 3,
      queryable: false,
    },
  ],
};
