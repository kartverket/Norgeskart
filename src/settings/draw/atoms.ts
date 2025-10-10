import { atom } from 'jotai';
import { Fill, RegularShape, Stroke, Style, Text } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { DrawType } from '../../draw/drawControls/hooks/drawSettings';

export const DEFAULT_PRIMARY_COLOR = '#0e5aa0ff';
export const DEFAULT_SECONDARY_COLOR = '#1d823b80';

export type LineWidth = 2 | 4 | 8;

export type DistanceUnit = 'm' | 'NM';

export type PointType = 'circle' | 'square' | 'triangle' | 'diamond' | 'star';

export type TextFontSize = 12 | 16 | 24;

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
        color: secondaryColor,
      }),
    }),
    stroke: new Stroke({
      color: primaryColor,
      width: lineWidth,
    }),
    fill: new Fill({
      color: secondaryColor,
    }),
    zIndex: 0,
  });
});

export const drawTypeStateAtom = atom<DrawType | null>(null);

export const drawEnabledAtom = atom<boolean>(false);
export const showMeasurementsAtom = atom<boolean>(false);
export const distanceUnitAtom = atom<DistanceUnit>('m');

export const pointTypeAtom = atom<PointType>('circle');

export const pointStyleReadAtom = atom((get) => {
  const type = get(pointTypeAtom);
  const secondaryColor = get(secondaryColorAtom);
  const lineWidth = get(lineWidthAtom);
  const pointRadius = lineWidth * 3;

  switch (type) {
    case 'circle':
      return new Style({
        image: new CircleStyle({
          radius: pointRadius,
          fill: new Fill({ color: secondaryColor }),
        }),
      });
    case 'square':
      return new Style({
        image: new RegularShape({
          points: 4,
          radius: pointRadius,
          angle: Math.PI / 4,
          fill: new Fill({ color: secondaryColor }),
        }),
      });
    case 'triangle':
      return new Style({
        image: new RegularShape({
          points: 3,
          radius: pointRadius,
          fill: new Fill({ color: secondaryColor }),
        }),
      });
    case 'diamond':
      return new Style({
        image: new RegularShape({
          points: 4,
          radius: pointRadius,
          angle: 0,
          scale: [1, 1.7],
          fill: new Fill({ color: secondaryColor }),
        }),
      });
    case 'star':
      return new Style({
        image: new RegularShape({
          points: 5,
          radius: pointRadius,
          radius2: pointRadius / 2,
          fill: new Fill({ color: secondaryColor }),
        }),
      });
    default:
      return new Style({
        image: new CircleStyle({
          radius: pointRadius,
          fill: new Fill({ color: secondaryColor }),
        }),
      });
  }
});

export const textInputAtom = atom('');

export const textFontSizeAtom = atom<TextFontSize>(12);

export const textStyleReadAtom = atom((get) => {
  const textColor = get(primaryColorAtom);
  const backgroundColor = get(secondaryColorAtom);
  const fontSize = get(textFontSizeAtom);

  return new Style({
    text: new Text({
      font: `${fontSize}px Mulish`,
      fill: new Fill({ color: textColor }),
      backgroundFill: new Fill({ color: backgroundColor }),
    }),
  });
});
