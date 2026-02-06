import { atom } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { mapAtom } from '../../map/atoms';

export const printBoxCenterAtom = atom<[number, number] | null>(null);
export const printBoxExtentAtom = atom<number[] | null>(null);

export const printBoxLayoutAtom = atom<{ widthPx: number; heightPx: number }>({
  widthPx: 555, //A4 default
  heightPx: 760,
});

export const printBoxExtentEffect = atomEffect((get, set) => {
  const map = get(mapAtom);
  const center = get(printBoxCenterAtom);
  const layout = get(printBoxLayoutAtom);
  if (!map || !center || !layout) return;

  const view = map.getView();

  const updateExtent = () => {
    const resolution = view.getResolution();
    if (!resolution) return;

    const widthMeters = layout.widthPx * resolution;
    const heightMeters = layout.heightPx * resolution;

    const minX = center[0] - widthMeters / 2;
    const maxX = center[0] + widthMeters / 2;
    const minY = center[1] - heightMeters / 2;
    const maxY = center[1] + heightMeters / 2;
    set(printBoxExtentAtom, [minX, minY, maxX, maxY]);
  };
  updateExtent();

  view.on('change:resolution', updateExtent);
  return () => {
    view.un('change:resolution', updateExtent);
  };
});
