import { useAtom } from 'jotai';
import {
  lineWidthEffect,
  primaryColorEffect,
  secondaryColorEffect,
} from './draw/effects';

export const Observers = () => {
  useAtom(primaryColorEffect);
  useAtom(secondaryColorEffect);
  useAtom(lineWidthEffect);

  return <></>;
};
