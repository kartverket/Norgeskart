import { useAtom } from 'jotai';
import { drawStyleEffect } from './draw/effects';

export const Observers = () => {
  useAtom(drawStyleEffect);

  return <></>;
};
