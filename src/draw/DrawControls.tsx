import { VStack } from '@kvib/react';
import { useEffect } from 'react';
import { useDrawSettings } from '../draw/drawHooks.ts';
import { ColorControls } from './ColorControls.tsx';
import { DrawControlFooter } from './DrawControlsFooter.tsx';
import { DrawToolSelector } from './DrawToolSelector.tsx';
import { LineWidthControl } from './LineWidthControl.tsx';
import { MeasurementControls } from './MeasurementControls.tsx';

export const DrawControls = () => {
  const { abortDrawing } = useDrawSettings();

  useEffect(() => {
    const keyListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        abortDrawing();
      }
    };
    document.addEventListener('keydown', keyListener);
    return () => {
      document.removeEventListener('keydown', keyListener);
    };
  }, [abortDrawing]);

  return (
    <VStack alignItems={'flex-start'} width={'100%'}>
      <DrawToolSelector />
      <ColorControls />
      <LineWidthControl />
      <MeasurementControls />
      <DrawControlFooter />
    </VStack>
  );
};
