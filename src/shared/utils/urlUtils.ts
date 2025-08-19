export const setUrlParameter = (
  key: NKUrlParameter,
  value: string | number | boolean,
): void => {
  const url = new URL(window.location.href);
  url.searchParams.set(key, String(value));
  window.history.replaceState({}, '', url.toString());
};

export const getUrlParameter = (key: NKUrlParameter): string | null => {
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
};

export type NKUrlParameter =
  | 'projection'
  | 'backgroundLayer'
  | 'rotation'
  | 'lat'
  | 'lon'
  | 'zoom'
  | 'drawing';
