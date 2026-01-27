import { Button, Heading, HStack, VStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  useDrawControlsKeyboardEffects();
  useAtom(distanceUnitAtomEffect);

  return (
    <VStack alignItems={'flex-start'} width={'100%'} padding={.5}>
      <DrawToolSelector/>
      {drawType === 'Text' && <TextStyleControl />}
      <Heading size="md">Faktiske tegneting(dev)</Heading>
      <EditControls />
      <HStack width="100%" paddingTop={"4"}>
        <ColorControls/>
        {drawType === 'Point' && <PointStyleSelector />}
      </HStack>
      {isMobile && drawType == 'Move' && (
        <Button onClick={deleteSelected}>{t('draw.deleteSelection')}</Button>
      )}
      <LineWidthControl />
      <MeasurementControls />
      <DrawControlFooter />
    </VStack>
  );
};
