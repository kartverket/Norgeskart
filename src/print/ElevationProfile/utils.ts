export type SampleDistance =
  | 1
  | 5
  | 10
  | 30
  | 50
  | 100
  | 200
  | 500
  | 1000
  | 10000
  | 100000;

const maxSamples = 200;

export const getSamleDistance = (featureLength: number): SampleDistance => {
  const rawDistance = featureLength / maxSamples;
  if (rawDistance <= 1) return 1;
  if (rawDistance <= 5) return 5;
  if (rawDistance <= 10) return 10;
  if (rawDistance <= 30) return 30;
  if (rawDistance <= 50) return 50;
  if (rawDistance <= 100) return 100;
  if (rawDistance <= 200) return 200;
  if (rawDistance <= 500) return 500;
  if (rawDistance <= 1000) return 1000;
  if (rawDistance <= 10000) return 10000;
  if (rawDistance <= 100000) return 100000;
  return 100000;
};
