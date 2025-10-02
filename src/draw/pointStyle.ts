import { getDefaultStore } from 'jotai';
import { Fill, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import RegularShape from 'ol/style/RegularShape';
import {
  lineWidthAtom,
  PointStyle,
  primaryColorAtom,
} from '../settings/draw/atoms';

export const getPointStyle = (style: PointStyle) => {
  const store = getDefaultStore();
  const primaryColor = store.get(primaryColorAtom);
  const lineWidth = store.get(lineWidthAtom);
  const pointRadius = lineWidth * 2;

  switch (style) {
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
};
