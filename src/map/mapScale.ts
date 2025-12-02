import Map from 'ol/Map';
import { getPointResolution } from 'ol/proj';

const DPI = 96;
const METERS_PER_INCH = 0.0254;

//Converts map resolution (meters per pixel) to scale
export const getScaleFromResolution = (
  resolution: number,
  map: Map,
  round = true,
) => {
  const view = map.getView();
  const projection = view.getProjection();
  const center = view.getCenter();

  if (!center) throw new Error('Map center undefined');

  const pointResolution = getPointResolution(projection, resolution, center);
  const metersPerUnit = projection.getMetersPerUnit() ?? 1;

  const scale = pointResolution * metersPerUnit * DPI / METERS_PER_INCH;

  return round ? Math.round(scale) : scale;
};

//Converts a scale to map resolution (meters per pixel)
export const scaleToResolution = (scale: number, map: Map) => {
  const view = map.getView();
  const projection = view.getProjection();

  const metersPerUnit = projection.getMetersPerUnit() ?? 1;
  const resolution = scale * METERS_PER_INCH / (DPI * metersPerUnit);

  return resolution;
};
