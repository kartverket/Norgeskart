import { atom } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { mapAtom } from '../../map/atoms';
import { getScaleFromResolution } from '../../map/mapScale';

export const printBoxCenterAtom = atom<[number, number] | null>(null);
export const printBoxExtentAtom = atom<number[] | null>(null);

export const printBoxLayoutAtom = atom<{ widthMm: number; heightMm: number }>({
  widthMm: 210, //default A4
  heightMm: 297,
});

export const printBoxExtentEffect = atomEffect((get, set) => {
  const map = get(mapAtom);
  const center = get(printBoxCenterAtom);
  const layout = get(printBoxLayoutAtom);
  if (!map || !center || !layout) return;

  const view = map.getView();

  const updateExtent = () => {
    const resolution = view.getResolution();
    const scale = resolution ? getScaleFromResolution(resolution, map) : 25000;
    const widthMeters = layout.widthMm / 1000;
    const heightMeters = layout.heightMm / 1000;
    const boxWidth = widthMeters * scale;
    const boxHeight = heightMeters * scale;
    const minX = center[0] - boxWidth / 2;
    const maxX = center[0] + boxWidth / 2;
    const minY = center[1] - boxHeight / 2;
    const maxY = center[1] + boxHeight / 2;
    set(printBoxExtentAtom, [minX, minY, maxX, maxY]);
  };
  updateExtent();
  view.on('change:resolution', updateExtent);
  return () => {
    view.un('change:resolution', updateExtent);
  };
});
