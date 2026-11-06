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
  // rGIS WMS roots for the Topo farge/graa/forenklet theme layers; empty hides the themes.
  topoRgis: {
    fargeUrl: string;
    graaUrl: string;
    forenkletUrl: string;
  };
  topoCache: {
    baseUrl: string;
    // WMTS layer names differ per MapProxy: atgcp1-dev only serves the legacy topo* names.
    layers: {
      standard: string;
      standard2x: string;
      gray: string;
      // tnt-topo-qlr forenklet_farge/ (not prod): unset hides the background.
      forenklet?: string;
    };
  };
};

// Internal hosts: the themes only load on the Kartverket network.
const RGIS_DEV = {
  fargeUrl: 'https://tnt-rgis.atgcp1-dev.kartverket-intern.cloud',
  graaUrl: 'https://tnt-rgis-graa.atgcp1-dev.kartverket-intern.cloud',
  forenkletUrl: 'https://tnt-rgis-forenklet.atgcp1-dev.kartverket-intern.cloud',
};

// rGIS-backed MapProxy on atgcp1-dev: the public host every environment's background uses.
const KART_BASE_URL = 'https://kart.atgcp1-dev.kartverket.cloud';
const KART_LAYERS = {
  standard: 'topo',
  standard2x: 'topo_2x',
  gray: 'topo_graa',
};
// Everything but prod also gets the forenklet background (tnt-topo-qlr forenklet_farge/).
const KART_LAYERS_NON_PROD = { ...KART_LAYERS, forenklet: 'topo_forenklet' };

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
    topoRgis: RGIS_DEV,
    topoCache: {
      // baseUrl: 'http://localhost:8085',
      baseUrl: KART_BASE_URL,
      layers: KART_LAYERS_NON_PROD,
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
    topoRgis: RGIS_DEV,
    topoCache: {
      baseUrl: KART_BASE_URL,
      layers: KART_LAYERS_NON_PROD,
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
    topoRgis: { fargeUrl: '', graaUrl: '', forenkletUrl: '' },
    topoCache: {
      baseUrl: KART_BASE_URL,
      layers: KART_LAYERS,
    },
  },
  envName: 'prod',
  heightDataApiUrl: 'https://hoydedata.no/arcgis/rest',
  printApiUrl: 'https://api.norgeskart.no',
};

// test.norgeskart.no: prod settings, plus the forenklet background and the internal rGIS themes.
const TEST_ENV: Env = {
  ...PROD_ENV,
  layerProviderParameters: {
    ...PROD_ENV.layerProviderParameters,
    topoRgis: RGIS_DEV,
    topoCache: {
      baseUrl: KART_BASE_URL,
      layers: KART_LAYERS_NON_PROD,
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
