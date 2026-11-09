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
  eccProxy: {
    wmsUrl: string;
  };
  npolar: {
    baseUrl: string;
  };
  // MapProxy serving the new Norgeskart Standard background (WMTS).
  topoCache: {
    baseUrl: string;
    layers: { standard: string; standard2x: string };
  };
};

// Same rGIS-backed MapProxy as test.norgeskart.no. kart.api.kartverket.no is down
// since 2026-11-05; switch baseUrl + norgeskart_* layer names once it serves again.
const TOPO_CACHE = {
  baseUrl: 'https://kart.atgcp1-dev.kartverket.cloud',
  layers: { standard: 'topo', standard2x: 'topo_2x' },
};

type EnvName = 'local' | 'dev' | 'test' | 'prod';
type Env = {
  apiUrl: string;
  heightDataApiUrl: string;
  geoNorgeApiBaseUrl: string;
  printApiUrl: string;
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
    eccProxy: {
      wmsUrl: 'https://tnt-proxy.atkv3-dev.kartverket-intern.cloud/wms',
    },
    npolar: {
      baseUrl: 'https://geodata.npolar.no',
    },
    topoCache: TOPO_CACHE,
  },
  envName: 'local',
  heightDataApiUrl: 'https://hoydedata.no/arcgis/rest',
  printApiUrl: 'https://testapi.norgeskart.no',
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
    eccProxy: {
      wmsUrl: 'https://tnt-proxy.atkv3-prod.kartverket.cloud/wms',
    },
    npolar: {
      baseUrl: 'https://geodata.npolar.no',
    },
    topoCache: TOPO_CACHE,
  },
  envName: 'dev',
  heightDataApiUrl: 'https://hoydedata.no/arcgis/rest',
  printApiUrl: 'https://testapi.norgeskart.no',
};

const PROD_ENV: Env = {
  usePostHog: true,
  apiUrl: 'https://api.norgeskart.no',
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
    eccProxy: {
      wmsUrl: 'https://tnt-proxy.atkv3-prod.kartverket.cloud/wms',
    },
    npolar: {
      baseUrl: 'https://geodata.npolar.no',
    },
    topoCache: TOPO_CACHE,
  },
  envName: 'prod',
  heightDataApiUrl: 'https://hoydedata.no/arcgis/rest',
  printApiUrl: 'https://api.norgeskart.no',
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
