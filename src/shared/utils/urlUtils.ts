const getSearchParams = (): URLSearchParams => {
  // Helper to parse URL parameters from both modern (?param=value) and legacy (#!?param=value) formats
  const url = new URL(window.location.href);
  if (url.hash.startsWith('#!?')) {
    const hashParams = url.hash.substring(3);
    return new URLSearchParams(hashParams);
  }
  return url.searchParams;
};

export const setUrlParameter = (
  key: NKUrlParameter,
  value: string | number | boolean,
): void => {
  const url = new URL(window.location.href);
  url.hash = '';
  url.searchParams.set(key, String(value));
  window.history.replaceState({}, '', url.toString());
};

export const removeUrlParameter = (key: NKUrlParameter): void => {
  const url = new URL(window.location.href);
  url.hash = '';
  url.searchParams.delete(key);
  window.history.replaceState({}, '', url.toString());
};

export const getUrlParameter = (key: NKUrlParameter): string | null => {
  return getSearchParams().get(key);
};

export const setListUrlParameter = (
  key: NKUrlParameter,
  values: (string | number | boolean)[],
): void => {
  const url = new URL(window.location.href);
  url.hash = '';
  url.searchParams.set(key, values.map(String).join(','));
  window.history.replaceState({}, '', url.toString());
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
  const url = new URL(window.location.href);
  url.hash = '';
  const param = getSearchParams().get(key);
  let values: string[] = [];
  if (param) {
    values = param.split(',');
  }
  const stringValue = String(value);
  if (!values.includes(stringValue)) {
    values.push(stringValue);
    url.searchParams.set(key, values.join(','));
    window.history.replaceState({}, '', url.toString());
  }
};

export const removeFromUrlListParameter = (
  key: NKUrlParameter,
  value: string | number | boolean,
): void => {
  const url = new URL(window.location.href);
  url.hash = '';
  const param = getSearchParams().get(key);
  if (param) {
    let values = param.split(',');
    const stringValue = String(value);
    values = values.filter((v) => v !== stringValue);
    const valueToSet = values.join(',');
    if (valueToSet === '') {
      url.searchParams.delete(key);
      window.history.replaceState({}, '', url.toString());
    } else {
      url.searchParams.set(key, valueToSet);
      window.history.replaceState({}, '', url.toString());
    }
  }
};

export type NKUrlParameter =
  | 'projection'
  | 'backgroundLayer'
  | 'themeLayers'
  | 'rotation'
  | 'lat'
  | 'lon'
  | 'zoom'
  | 'drawing'
  | 'layers' // Legacy parameter from old norgeskart.no
  | 'sok';
