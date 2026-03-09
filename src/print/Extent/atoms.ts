import { atom } from 'jotai';
import Map from 'ol/Map';

export const printBoxLayoutAtom = atom<{ widthPx: number; heightPx: number }>({
  widthPx: 555, //A4 default
  heightPx: 760,
});

export const getExtentFromMap = (
  map: Map,
  layout: { widthPx: number; heightPx: number },
): number[] | null => {
  const view = map.getView();
  const resolution = view.getResolution();
  const center = view.getCenter();
  if (!resolution || !center) return null;

  const widthMeters = layout.widthPx * resolution;
  const heightMeters = layout.heightPx * resolution;

  const minX = center[0] - widthMeters / 2;
  const maxX = center[0] + widthMeters / 2;
  const minY = center[1] - heightMeters / 2;
  const maxY = center[1] + heightMeters / 2;
  return [minX, minY, maxX, maxY];
};
