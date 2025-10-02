import { atom } from 'jotai';
import { Fill, RegularShape, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { DrawType } from '../../draw/drawHooks';

export const DEFAULT_PRIMARY_COLOR = '#1d823b80';
export const DEFAULT_SECONDARY_COLOR = '#0e5aa0ff';

export type LineWidth = 2 | 4 | 8;

export type DistanceUnit = 'm' | 'NM';

export type PointType = 'circle' | 'square' | 'triangle' | 'diamond' | 'star';

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

export const pointTypeAtom = atom<PointType>('circle');

export const pointStyleReadAtom = atom((get) => {
  const type = get(pointTypeAtom);
  const primaryColor = get(primaryColorAtom);
  const lineWidth = get(lineWidthAtom);
  const pointRadius = lineWidth * 2;

  switch (type) {
    case 'circle':
      return new Style({
        image: new CircleStyle({
          radius: pointRadius,
          fill: new Fill({ color: primaryColor }),
        }),
      });
    case 'square':
      return new Style({
        image: new RegularShape({
          points: 4,
          radius: pointRadius,
          angle: Math.PI / 4,
          fill: new Fill({ color: primaryColor }),
        }),
      });
    case 'triangle':
      return new Style({
        image: new RegularShape({
          points: 3,
          radius: pointRadius,
          fill: new Fill({ color: primaryColor }),
        }),
      });
    case 'diamond':
      return new Style({
        image: new RegularShape({
          points: 4,
          radius: pointRadius,
          angle: 0,
          scale: [1, 1.7],
          fill: new Fill({ color: primaryColor }),
        }),
      });
    case 'star':
      return new Style({
        image: new RegularShape({
          points: 5,
          radius: pointRadius,
          radius2: pointRadius / 2,
          fill: new Fill({ color: primaryColor }),
        }),
      });
    default:
      return new Style({
        image: new CircleStyle({
          radius: pointRadius,
          fill: new Fill({ color: primaryColor }),
        }),
      });
  }
});
