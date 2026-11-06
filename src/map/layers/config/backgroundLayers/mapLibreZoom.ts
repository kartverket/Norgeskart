import { View } from 'ol';
import { getPointResolution, toLonLat } from 'ol/proj';

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
