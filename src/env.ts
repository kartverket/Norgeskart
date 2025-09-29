export type EnvName = 'local' | 'dev' | 'prod';
export type Env = {
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

const PROD_ENV: Env = {
  apiUrl: 'https://testapi.norgeskart.no',
  envName: 'prod',
};

const getEnvName = (): EnvName => {
  const baseUrl = document.location.hostname;

  switch (baseUrl) {
    case 'localhost':
      return 'local';
    case 'norgeskart5.atgcp1-dev.kartverket-intern.cloud':
    case 'norgeskart5.atkv3-dev.kartverket-intern.cloud':
      return 'dev';
    case 'norgeskart5.atkv3-prod.kartverket-intern.cloud':
    case 'norgeskart.no':
      return 'prod';
    default:
      throw new Error('Unknown environment');
  }
};

const getEnv = (): Env => {
  const envName = getEnvName();
  switch (envName) {
    case 'local':
      return LOCAL_ENV;
    case 'dev':
      return DEV_ENV;
    case 'prod':
      return PROD_ENV;
  }
};

export { getEnv, getEnvName };
