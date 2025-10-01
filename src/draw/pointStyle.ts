import { getDefaultStore } from 'jotai';
import { Fill, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import RegularShape from 'ol/style/RegularShape';
import {
  PointStyle,
  primaryColorAtom,
} from '../settings/draw/atoms';

export const getPointStyle = (style: PointStyle) => {
  const store = getDefaultStore();
  const primaryColor = store.get(primaryColorAtom);

  switch (style) {
    case 'circle':
      return new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: primaryColor }),
        }),
      });
    case 'square':
      return new Style({
        image: new RegularShape({
          points: 4,
          radius: 8,
          angle: Math.PI / 4,
          fill: new Fill({ color: primaryColor }),
        }),
      });
    case 'triangle':
      return new Style({
        image: new RegularShape({
          points: 3,
          radius: 10,
          fill: new Fill({ color: primaryColor }),
        }),
      });
    default:
      return new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: primaryColor }),
        }),
      });
  }
};
