export const HASH_ROUTING_PREFIX = '#!?';

const isUsingHashRouting = (url: URL): boolean => {
  return url.hash.startsWith(HASH_ROUTING_PREFIX);
};

const getSearchParams = (): URLSearchParams => {
  const url = new URL(window.location.href);
  if (isUsingHashRouting(url)) {
    const hashParams = url.hash.substring(HASH_ROUTING_PREFIX.length);
    return new URLSearchParams(hashParams);
  }
  return url.searchParams;
};

const updateUrl = (
  url: URL,
  updateFn: (params: URLSearchParams) => void,
): void => {
  if (isUsingHashRouting(url)) {
    const hashParams = new URLSearchParams(
      url.hash.substring(HASH_ROUTING_PREFIX.length),
    );
    updateFn(hashParams);
    url.hash = HASH_ROUTING_PREFIX + hashParams.toString();
  } else {
    url.hash = '';
    updateFn(url.searchParams);
  }
  window.history.replaceState({}, '', url.toString());
};

export const setUrlParameter = (
  key: NKUrlParameter,
  value: string | number | boolean,
): void => {
  const url = new URL(window.location.href);
  updateUrl(url, (params) => params.set(key, String(value)));
};

export const removeUrlParameter = (key: NKUrlParameter): void => {
  const url = new URL(window.location.href);
  updateUrl(url, (params) => params.delete(key));
};

export const getUrlParameter = (key: NKUrlParameter): string | null => {
  return getSearchParams().get(key);
};

export const getAllUrlParameters = (key: NKUrlParameter): string[] => {
  return getSearchParams().getAll(key);
};

export const setListUrlParameter = (
  key: NKUrlParameter,
  values: (string | number | boolean)[],
): void => {
  const url = new URL(window.location.href);
  updateUrl(url, (params) => params.set(key, values.map(String).join(',')));
};

export const getListUrlParameter = (key: NKUrlParameter): string[] | null => {
  const param = getSearchParams().get(key);
  if (param) {
    return param.split(',');
  }
  return null;
};

export const addToUrlListParameter = (
  key: NKUrlParameter,
  value: string | number | boolean,
): void => {
  const param = getSearchParams().get(key);
  const values: string[] = param ? param.split(',') : [];
  const stringValue = String(value);

  if (!values.includes(stringValue)) {
    values.push(stringValue);
    const url = new URL(window.location.href);
    updateUrl(url, (params) => params.set(key, values.join(',')));
  }
};

export const removeFromUrlListParameter = (
  key: NKUrlParameter,
  value: string | number | boolean,
): void => {
  const param = getSearchParams().get(key);
  if (!param) return;

  const stringValue = String(value);
  const values = param.split(',').filter((v) => v !== stringValue);
  const url = new URL(window.location.href);

  updateUrl(url, (params) => {
    if (values.length === 0) {
      params.delete(key);
    } else {
      params.set(key, values.join(','));
    }
  });
};

export const transitionHashToQuery = (): void => {
  const url = new URL(window.location.href);
  if (!isUsingHashRouting(url)) return;

  const hashParams = new URLSearchParams(
    url.hash.substring(HASH_ROUTING_PREFIX.length),
  );
  hashParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  url.hash = '';
  window.history.replaceState({}, '', url.toString());
};

export type NKUrlParameter =
  | 'projection'
  | 'backgroundLayer'
  | 'themeLayers'
  | 'rotation'
  | 'lat'
  | 'lon'
  | 'markerLat'
  | 'markerLon'
  | 'zoom'
  | 'drawing'
  | 'layers' // Legacy parameter from old norgeskart.no
  | 'project' // Legacy project parameter from old norgeskart.no
  | 'sok'
  | 'showSelection'
  | 'geojsonUrl';
