import MapLibreLayer from '@geoblocks/ol-maplibre-layer/lib/MapLibreLayer';
import type { JumpToOptions, MapOptions } from 'maplibre-gl';
import { gridConvergence, mercatorZoomForView } from './mapLibreZoom';

// ol-maplibre-layer sets the bearing from the view rotation alone, with no hook like
// translateZoom, so the correction has to sit on the call it makes each frame.
const alignBearing = (layer: MapLibreLayer) => {
  const ml = layer.mapLibreMap;
  if (!ml) return;

  const jumpTo = ml.jumpTo.bind(ml);
  ml.jumpTo = (options: JumpToOptions) => {
    const view = layer.getMapInternal()?.getView();
    const bearing = (options.bearing ?? 0) - (view ? gridConvergence(view) : 0);
    return jumpTo({ ...options, bearing });
  };
};

export const createMapLibreLayer = (
  mapLibreOptions: Omit<MapOptions, 'container'>,
  id: string,
  matchView: boolean,
  properties: Record<string, unknown> = { isVectorTile: true },
) => {
  const layer: MapLibreLayer = new MapLibreLayer({
    mapLibreOptions,
    // OL's zoom only means Mercator zoom in EPSG:3857; elsewhere derive it from the view.
    translateZoom: matchView
      ? (zoom) => {
          const view = layer.getMapInternal()?.getView();
          return view ? (mercatorZoomForView(view) ?? zoom) : zoom;
        }
      : undefined,
    properties: { id, ...properties },
  });
  if (matchView) layer.once('load' as never, () => alignBearing(layer));
  return layer;
};
