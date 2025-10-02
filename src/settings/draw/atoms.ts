import { atom } from 'jotai';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { DrawType } from '../../draw/drawHooks';

export const DEFAULT_PRIMARY_COLOR = '#1d823b80';
export const DEFAULT_SECONDARY_COLOR = '#0e5aa0ff';

export type LineWidth = 2 | 4 | 8;

export type DistanceUnit = 'm' | 'NM';

export type PointStyle = 'circle' | 'square' | 'triangle' | 'diamond' | 'star';

export const primaryColorAtom = atom<string>(DEFAULT_PRIMARY_COLOR);
export const secondaryColorAtom = atom<string>(DEFAULT_SECONDARY_COLOR);
export const lineWidthAtom = atom<LineWidth>(2);

export const drawStyleReadAtom = atom((get) => {
  const primaryColor = get(primaryColorAtom);
  const secondaryColor = get(secondaryColorAtom);
  const lineWidth = get(lineWidthAtom);
  return new Style({
    image: new CircleStyle({
      radius: lineWidth,
      fill: new Fill({
        color: primaryColor,
      }),
    }),
    stroke: new Stroke({
      color: secondaryColor,
      width: lineWidth,
    }),
    fill: new Fill({
      color: primaryColor,
    }),
  });
});

export const drawTypeStateAtom = atom<DrawType | null>(null);

export const drawEnabledAtom = atom<boolean>(false);
export const showMeasurementsAtom = atom<boolean>(false);
export const distanceUnitAtom = atom<DistanceUnit>('m');

export const pointStyleAtom = atom<PointStyle>('circle');
