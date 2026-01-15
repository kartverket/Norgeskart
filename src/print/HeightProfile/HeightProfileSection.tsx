import { Stack } from '@kvib/react';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { profileEffect } from './atoms';
import {
  addDrawInteractionToMap,
  removeDrawInteractionFromMap,
} from './drawUtils';
import { HeightProfileChart } from './HeightProfileChart';

export const HeightProfileSection = () => {
  useAtom(profileEffect);
  useEffect(() => {
    addDrawInteractionToMap();
    return () => {
      removeDrawInteractionFromMap();
    };
  }, []);
  return (
    <Stack>
      Hei på deg høydeprofil!
      <HeightProfileChart />
    </Stack>
  );
};
