export const setUrlParameter = (
  key: string,
  value: string | number | boolean,
): void => {
  const url = new URL(window.location.href);
  url.searchParams.set(key, String(value));
  window.history.replaceState({}, '', url.toString());
};

export const getUrlParameter = (key: string): string | null => {
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
};
