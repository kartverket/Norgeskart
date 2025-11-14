type EnvName = 'local' | 'dev' | 'test' | 'prod';
type Env = {
  apiUrl: string;
  geoNorgeWMSUrl: string;
  geoNorgeApiBaseUrl: string;
  envName: EnvName;
};

const LOCAL_ENV: Env = {
  apiUrl: 'https://testapi.norgeskart.no',
  geoNorgeWMSUrl: 'https://wms.geonorge.no/skwms1/wms',
  geoNorgeApiBaseUrl: 'https://ws.geonorge.no',
  envName: 'local',
};

const DEV_ENV: Env = {
  apiUrl: 'https://testapi.norgeskart.no',
  geoNorgeWMSUrl: 'https://wms.geonorge.no/skwms1/wms',
  geoNorgeApiBaseUrl: 'https://ws.geonorge.no',
  envName: 'dev',
};

const TEST_ENV: Env = {
  apiUrl: 'https://testapi.norgeskart.no',
  geoNorgeWMSUrl: 'https://wms.geonorge.no/skwms1/wms',
  geoNorgeApiBaseUrl: 'https://ws.geonorge.no',
  envName: 'test',
};

const PROD_ENV: Env = {
  apiUrl: 'https://testapi.norgeskart.no',
  geoNorgeWMSUrl: 'https://wms.geonorge.no/skwms1/wms',
  geoNorgeApiBaseUrl: 'https://ws.geonorge.no',
  envName: 'prod',
};

const getEnvName = (): EnvName => {
  return getEnv().envName;
};

const getEnv = (): Env => {
  const domain = document.location.hostname;
  switch (domain) {
    case 'localhost':
      return LOCAL_ENV;
    case 'norgeskart.atgcp1-dev.kartverket-intern.cloud':
      return DEV_ENV;
    case 'norgeskart.atgcp1-prod.kartverket-intern.cloud':
    case 'test.norgeskart.no':
      return TEST_ENV;
    case 'norgeskart.no':
      return PROD_ENV;
    default:
      throw new Error('Unknown environment');
  }
};

export { getEnv, getEnvName };
