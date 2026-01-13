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
  kartverketTopoWMS?: {
    baseUrl: string;
  };
};

type EnvName = 'local' | 'dev' | 'test' | 'prod';
type Env = {
  apiUrl: string;
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
        'QtFmMDmnsoVno-q57lJceiJZECE2vsxbc5o9M3U3NQZBfyjWzpmpwzuyTFS-9dgt',
    },
    kartverketCache: {
      baseUrl: 'https://cache.kartverket.no',
    },
    geoNorgeWMS: {
      baseUrl: 'https://wms.geonorge.no/skwms1/wms',
    },
    kartverketTopoWMS: {
      baseUrl: 'https://kart.atgcp1-dev.kartverket-intern.cloud/topo/v1/ows',
    },
  },
  envName: 'local',
  emergencyPosterBaseUrl: 'https://nodplakat.norgeskart.no/fop2/fop',
};

const DEV_ENV: Env = {
  usePostHog: true,
  apiUrl: 'https://testapi.norgeskart.no',
  geoNorgeApiBaseUrl: 'https://ws.geonorge.no',
  layerProviderParameters: {
    norgeIBilder: {
      baseUrl: 'https://tilecache.norgeibilder.no',
      apiKey:
        'QtFmMDmnsoVno-q57lJcemfvn7mqMQwgmV0iOBRmE7r4BOMdUgOHUm2KhICHF7zmr45l-P4-Lzoazyp9kxDTXA..',
    },
    kartverketCache: {
      baseUrl: 'https://cache.kartverket.no',
    },
    geoNorgeWMS: {
      baseUrl: 'https://wms.geonorge.no/skwms1/wms',
    },
    kartverketTopoWMS: {
      baseUrl: 'https://kart.atgcp1-dev.kartverket-intern.cloud/topo/v1/ows',
    },
  },
  envName: 'dev',
  emergencyPosterBaseUrl: 'https://nodplakat.norgeskart.no/fop2/fop',
};

const PROD_ENV: Env = {
  usePostHog: true,
  apiUrl: 'https://testapi.norgeskart.no',
  geoNorgeApiBaseUrl: 'https://ws.geonorge.no',
  layerProviderParameters: {
    norgeIBilder: {
      baseUrl: 'https://tilecache.norgeibilder.no',
      apiKey:
        'QtFmMDmnsoVno-q57lJcem8vr-Ai7rjF5QvG5I4bkGpVQs2QlmcuuHmreysu4Qdz',
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
};

const getEnvName = (): EnvName => {
  return getEnv().envName;
};

const getEnv = (): Env => {
  const domain = document.location.hostname;
  const previewRegex =
    /norgeskart-preview-.+.atgcp1-dev\.kartverket-intern\.cloud/m;
  if (domain == 'localhost') {
    return LOCAL_ENV;
  }
  if (domain == 'norgeskart.atgcp1-dev.kartverket-intern.cloud') {
    return DEV_ENV;
  }
  if (previewRegex.test(domain)) {
    return DEV_ENV;
  }
  if (domain == 'test.norgeskart.no') {
    return PROD_ENV;
  }

  throw new Error(`Unknown environment for domain: ${domain}`);
};

export { getEnv, getEnvName };
