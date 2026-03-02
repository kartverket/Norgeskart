type layerProviderParameters = {
  norgeIBilder: {
    baseUrl: string;
    apiKey: string;
  };
  kartverketCache: {
    baseUrl: string;
  };
  geoNorgeWMS: {
    baseUrl: string;
  };
};

type EnvName = 'local' | 'dev' | 'test' | 'prod';
type Env = {
  apiUrl: string;
  heightDataApiUrl: string;
  emergencyPosterBaseUrl: string;
  geoNorgeApiBaseUrl: string;
  usePostHog: boolean;
  layerProviderParameters: layerProviderParameters;
  envName: EnvName;
};

const LOCAL_ENV: Env = {
  usePostHog: false,
  apiUrl: 'https://testapi.norgeskart.no',
  geoNorgeApiBaseUrl: 'https://ws.geonorge.no',
  layerProviderParameters: {
    norgeIBilder: {
      baseUrl: 'https://tilecache.norgeibilder.no',
      apiKey:
        'XfHYfx1C2WFLyx_YIQ691V208TmiXQBOos-XW4ngvUx5-Ruh-_NJpLQ1YmBUDgnh',
    },
    kartverketCache: {
      baseUrl: 'https://cache.kartverket.no',
    },
    geoNorgeWMS: {
      baseUrl: 'https://wms.geonorge.no/skwms1/wms',
    },
  },
  envName: 'local',
  emergencyPosterBaseUrl: 'https://nodplakat.norgeskart.no/fop2/fop',
  heightDataApiUrl: 'https://hoydedata.no/arcgis/rest',
};

const DEV_ENV: Env = {
  usePostHog: true,
  apiUrl: 'https://testapi.norgeskart.no',
  geoNorgeApiBaseUrl: 'https://ws.geonorge.no',
  layerProviderParameters: {
    norgeIBilder: {
      baseUrl: 'https://tilecache.norgeibilder.no',
      apiKey:
        'C-Uchk2o_WKPxs1ySOgbV1fGDYisqK1ARRin1snVFgRypTS1HSw8xAQG_yL8-uBxHQpJpgU9qRqmH8Uo3iKLYA..',
    },
    kartverketCache: {
      baseUrl: 'https://cache.kartverket.no',
    },
    geoNorgeWMS: {
      baseUrl: 'https://wms.geonorge.no/skwms1/wms',
    },
  },
  envName: 'dev',
  emergencyPosterBaseUrl: 'https://nodplakat.norgeskart.no/fop2/fop',
  heightDataApiUrl: 'https://hoydedata.no/arcgis/rest',
};

const PROD_ENV: Env = {
  usePostHog: true,
  apiUrl: 'https://testapi.norgeskart.no',
  geoNorgeApiBaseUrl: 'https://ws.geonorge.no',
  layerProviderParameters: {
    norgeIBilder: {
      baseUrl: 'https://tilecache.norgeibilder.no',
      apiKey:
        'C-Uchk2o_WKPxs1ySOgbV_QfuZ-oS6b6gUCdXgAYPExQwx_lu0PpbszjZVXx0Lsc',
    },
    kartverketCache: {
      baseUrl: 'https://cache.kartverket.no',
    },
    geoNorgeWMS: {
      baseUrl: 'https://wms.geonorge.no/skwms1/wms',
    },
  },
  envName: 'prod',
  emergencyPosterBaseUrl: 'https://nodplakat.norgeskart.no/fop2/fop',
  heightDataApiUrl: 'https://hoydedata.no/arcgis/rest',
};

const getEnvName = (): EnvName => {
  return getEnv().envName;
};

const getEnv = (): Env => {
  const domain = document.location.hostname;
  const previewRegex =
    /norgeskart-preview-.+\.atkv3-dev\.kartverket(?:-intern)?\.cloud/m;
  if (domain == 'localhost') {
    return LOCAL_ENV;
  }
  if (
    domain == 'norgeskart.atgcp1-dev.kartverket-intern.cloud' ||
    domain == 'norgeskart5.atkv3-dev.kartverket-intern.cloud'
  ) {
    return DEV_ENV;
  }
  if (previewRegex.test(domain)) {
    return DEV_ENV;
  }
  if (
    domain == 'test.norgeskart.no' ||
    domain == 'norgeskart.no' ||
    domain == 'www.norgeskart.no'
  ) {
    return PROD_ENV;
  }
  console.error(`Unknown domain: ${domain}`);
  return DEV_ENV;
};

export { getEnv, getEnvName };
