type EnvName = 'local' | 'dev' | 'test' | 'prod';
type Env = {
  apiUrl: string;
  envName: EnvName;
};

const LOCAL_ENV: Env = {
  apiUrl: 'https://testapi.norgeskart.no',
  envName: 'local',
};

const DEV_ENV: Env = {
  apiUrl: 'https://testapi.norgeskart.no',
  envName: 'dev',
};

const TEST_ENV: Env = {
  apiUrl: 'https://testapi.norgeskart.no',
  envName: 'test',
};

const PROD_ENV: Env = {
  apiUrl: 'https://testapi.norgeskart.no',
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
    case 'norgeskart5.atgcp1-dev.kartverket-intern.cloud':
    case 'norgeskart5.atkv3-dev.kartverket-intern.cloud':
      return DEV_ENV;
    case 'norgeskart5.atgcp1-prod.kartverket-intern.cloud':
    case 'test.norgeskart.no':
      return TEST_ENV;
    case 'norgeskart5.atkv3-prod.kartverket-intern.cloud':
    case 'norgeskart.no':
      return PROD_ENV;
    default:
      throw new Error('Unknown environment');
  }
};

export { getEnv, getEnvName };
