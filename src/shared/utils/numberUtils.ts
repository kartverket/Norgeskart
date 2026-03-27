export const boundNumber = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};

export const isNumberOk = (value: number | undefined): boolean => {
  return value != null && !isNaN(value) && isFinite(value);
};
