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
  topoQgis: {
    clusterDomain: string;
  };
  topoQgisGraa: {
    clusterDomain: string;
  };
  topoCache: {
    baseUrl: string;
    // WMTS layer names differ per MapProxy: kart.api maps the norgeskart_* aliases,
    // the cluster-internal dev stacks only serve the legacy topo* names.
    layers: {
      standard: string;
      standard2x: string;
      gray: string;
    };
  };
};

const KART_API_LAYERS = {
  standard: 'norgeskart_standard',
  standard2x: 'norgeskart_standard_2x',
  gray: 'norgeskart_gray',
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
    topoQgis: {
      clusterDomain: 'atkv3-prod.kartverket-intern.cloud',
    },
    topoQgisGraa: {
      clusterDomain: 'atkv3-prod.kartverket-intern.cloud',
    },
    topoCache: {
      // baseUrl: 'http://localhost:8085',
      baseUrl: 'https://kart.api.kartverket.no',
      layers: KART_API_LAYERS,
    },
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
    topoQgis: {
      clusterDomain: 'atkv3-dev.kartverket-intern.cloud',
    },
    topoQgisGraa: {
      clusterDomain: 'atkv3-dev.kartverket-intern.cloud',
    },
    topoCache: {
      baseUrl: 'https://kart.api.kartverket.no',
      layers: KART_API_LAYERS,
    },
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
    topoQgis: {
      clusterDomain: 'atkv3-prod.kartverket-intern.cloud',
    },
    topoQgisGraa: {
      clusterDomain: 'atkv3-prod.kartverket-intern.cloud',
    },
    topoCache: {
      baseUrl: 'https://kart.api.kartverket.no',
      layers: KART_API_LAYERS,
    },
  },
  envName: 'prod',
  heightDataApiUrl: 'https://hoydedata.no/arcgis/rest',
  printApiUrl: 'https://api.norgeskart.no',
};

// test.norgeskart.no: prod settings, but the background comes from the rGIS-backed
// MapProxy on atgcp1-dev (public host; kart.atgcp1-dev.kartverket-intern.cloud is internal-only).
const TEST_ENV: Env = {
  ...PROD_ENV,
  layerProviderParameters: {
    ...PROD_ENV.layerProviderParameters,
    topoCache: {
      baseUrl: 'https://kart.atgcp1-dev.kartverket.cloud',
      layers: { standard: 'topo', standard2x: 'topo_2x', gray: 'topo_graa' },
    },
  },
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
  if (domain == 'test.norgeskart.no') {
    return TEST_ENV;
  }
  if (domain == 'norgeskart.no' || domain == 'www.norgeskart.no') {
    return PROD_ENV;
  }
  console.error(`Unknown domain: ${domain}`);
  return DEV_ENV;
};

export { getEnv, getEnvName };
