import { useAtom } from 'jotai';
import {
  drawStyleEffect,
  editPrimaryColorEffect,
  editSecondaryColorEffect,
  lineWidthEffect,
} from './draw/effects';

export const Observers = () => {
  useAtom(drawStyleEffect);
  useAtom(editPrimaryColorEffect);
  useAtom(editSecondaryColorEffect);
  useAtom(lineWidthEffect);

  return <></>;
};
