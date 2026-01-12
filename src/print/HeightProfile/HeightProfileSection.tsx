import { Stack } from '@kvib/react';
import { useEffect } from 'react';
import {
  addDrawInteractionToMap,
  removeDrawInteractionFromMap,
} from './drawUtils';

export const HeightProfileSection = () => {
  useEffect(() => {
    addDrawInteractionToMap();
    return () => {
      removeDrawInteractionFromMap();
    };
  }, []);
  return <Stack>Hei på deg høydeprofil!</Stack>;
};
