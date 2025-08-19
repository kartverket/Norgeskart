import { useAtom } from 'jotai';
import { primaryColorEffect, secondaryColorEffect } from './draw/effects';

export const Observers = () => {
  useAtom(primaryColorEffect);
  useAtom(secondaryColorEffect);

  return <></>;
};
