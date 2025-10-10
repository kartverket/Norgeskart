import { useAtom } from 'jotai';
import {
  drawStyleEffect,
  editPrimaryColorEffect,
  editSecondaryColorEffect,
} from './draw/effects';

export const Observers = () => {
  useAtom(drawStyleEffect);
  useAtom(editPrimaryColorEffect);
  useAtom(editSecondaryColorEffect);

  return <></>;
};
