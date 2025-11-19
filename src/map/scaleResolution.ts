import Map from 'ol/Map';

export const getScaleFromResolution = (
  resolution: number,
  units: string,
  round = true,
) => {
  const INCHES_PER_UNIT: Record<string, number> = { m: 39.37 };
  const DOTS_PER_INCH = 25.4 / 0.28;
  const scale = INCHES_PER_UNIT[units] * DOTS_PER_INCH * resolution;
  return round ? Math.round(scale) : scale;
};

export const scaleToResolution = (scale: number, map: Map) => {
  const dpi = 25.4 / 0.28;
  const mpu = map.getView().getProjection().getMetersPerUnit();
  if (!mpu) throw new Error('Meters per unit er undefined');
  return scale / (mpu * 39.37 * dpi);
};
