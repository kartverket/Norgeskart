import Map from 'ol/Map';

const DPI = 25.4 / 0.28;
const INCHES_PER_METER = 39.37;

export const getScaleFromResolution = (
  resolution: number,
  map: Map,
  round = true,
) => {
  const mpu = map.getView().getProjection().getMetersPerUnit();
  if (!mpu) throw new Error('Meters per unit er undefined');
  const scale = resolution * mpu * INCHES_PER_METER * DPI;
  return round ? Math.round(scale) : scale;
};

export const scaleToResolution = (scale: number, map: Map) => {
  const mpu = map.getView().getProjection().getMetersPerUnit();
  if (!mpu) throw new Error("Meters per unit er undefined");
  return scale / (mpu * INCHES_PER_METER * DPI);
};
