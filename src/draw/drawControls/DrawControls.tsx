import { HStack, IconButton, VStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { useIsMobileScreen } from '../../shared/hooks.ts';
import { ColorControls } from '../ColorControls.tsx';
import { DrawControlFooter } from '../DrawControlsFooter.tsx';
import { DrawToolSelector } from '../DrawToolSelector.tsx';
import { distanceUnitAtomEffect } from '../effects.ts';
import { LineWidthControl } from '../LineWidthControl.tsx';
import { MeasurementControls } from '../MeasurementControls.tsx';
import { PointStyleSelector } from '../PointStyleSelector.tsx';
import { TextStyleControl } from '../TextStyleControl.tsx';
import { useDrawControlsKeyboardEffects } from './drawControlsKeyboardEffects.ts';
import { EditControls } from './EditControls.tsx';
import { useDrawSettings } from './hooks/drawSettings.ts';

export const DrawControls = () => {
  const { drawType, deleteSelected } = useDrawSettings();
  const isMobile = useIsMobileScreen();

  useDrawControlsKeyboardEffects();
  useAtom(distanceUnitAtomEffect);

  return (
    <VStack alignItems={'flex-start'} width={'100%'} padding={0.5}>
      <DrawToolSelector />
      {drawType === 'Text' && <TextStyleControl />}
      <EditControls />
      <HStack width="100%">
        <ColorControls />
        {drawType === 'Point' && <PointStyleSelector />}
      </HStack>
      {isMobile && drawType == 'Move' && (
        <IconButton
          onClick={deleteSelected}
          colorPalette="red"
          icon="delete"
          size="md"
          variant="ghost"
        />
        // <Button onClick={deleteSelected} size="sm" >{t('draw.deleteSelection')}</Button>
      )}
      <LineWidthControl />
      <MeasurementControls />
      <DrawControlFooter />
    </VStack>
  );
};
