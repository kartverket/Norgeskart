import { View } from 'ol';
import { fromLonLat, getPointResolution, toLonLat } from 'ol/proj';

const EARTH_CIRCUMFERENCE_M = 40075016.68557849;

/**
 * Zoom for ol-maplibre-layer's translateZoom: matches MapLibre's ground scale to the view's.
 * Mercator stretches by 1/cos(lat), so the value depends on where the view is, not just its zoom.
 * The layer subtracts 1 for MapLibre's 512 px tiles, hence 256 here.
 */
export const mercatorZoom = (groundResolution: number, latitude: number) =>
  Math.log2(
    (EARTH_CIRCUMFERENCE_M * Math.cos((latitude * Math.PI) / 180)) /
      (256 * groundResolution),
  );

export const mercatorZoomForView = (view: View): number | undefined => {
  const center = view.getCenter();
  const resolution = view.getResolution();
  if (!center || !resolution) return undefined;

  const projection = view.getProjection();
  return mercatorZoom(
    getPointResolution(projection, resolution, center, 'm'),
    toLonLat(center, projection)[1],
  );
};

/**
 * Degrees from grid north to true north at the view's center. The MapLibre canvas is
 * always true-north-up, so outside EPSG:3857 it must turn by this to match the view.
 */
export const gridConvergence = (view: View): number => {
  const center = view.getCenter();
  if (!center) return 0;

  const projection = view.getProjection();
  const [lon, lat] = toLonLat(center, projection);
  const [x, y] = fromLonLat([lon, lat + 0.01], projection);
  return (Math.atan2(x - center[0], y - center[1]) * 180) / Math.PI;
};
