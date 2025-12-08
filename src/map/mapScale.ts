import Map from 'ol/Map';
import { getPointResolution } from 'ol/proj';

//DPI (dots per inch) based on the standard 0.28 mm per pixel used by OpenLayers
// Note: This is not the actual screen DPI, but a reference value for map scale calculations.
const DPI = 25.4 / 0.28;
const METERS_PER_INCH = 0.0254;

//Converts map resolutions to a map scale
//Resolution depeonds on the map projection and the map's current center
export const getScaleFromResolution = (resolution: number, map: Map) => {
  const view = map.getView();
  const projection = view.getProjection();
  const center = view.getCenter()!;

  const pointResolution = getPointResolution(projection, resolution, center);

  const metersPerPixel = pointResolution;

  const scale = (metersPerPixel * DPI) / METERS_PER_INCH;
  return Math.round(scale);
};

//Converts a map scale to an OpenLayers resolution
export const scaleToResolution = (scale: number, map: Map) => {
  const view = map.getView();
  const projection = view.getProjection();
  const center = view.getCenter();

  if (!center) return;

  const targetMetersPerPixel = (scale * METERS_PER_INCH) / DPI;

  const metersPerPixelInProjection = getPointResolution(projection, 1, center);

  return targetMetersPerPixel / metersPerPixelInProjection;
};
