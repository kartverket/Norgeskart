import Map from 'ol/Map';
import { getPointResolution } from 'ol/proj';

const DPI = 96;
const INCHES_PER_METER = 39.37;

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

  // getPointResolution tar hensyn til projeksjon og posisjon
  const pointResolution = getPointResolution(projection, resolution, center);
  const scale = pointResolution * INCHES_PER_METER * DPI;

  return round ? Math.round(scale) : scale;
};

//Converts a scale to map resolution (meters per pixel)
export const scaleToResolution = (scale: number, map: Map) => {
  const view = map.getView();
  const projection = view.getProjection();
  const center = view.getCenter();

  if (!center) throw new Error('Map center undefined');

  const pointResolution = scale / (INCHES_PER_METER * DPI);
  const resolution = getPointResolution(projection, pointResolution, center);

  return resolution;
};
