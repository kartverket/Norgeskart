import { Button, VStack } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { useIsMobileScreen } from '../../shared/hooks.ts';
import { ColorControls } from '../ColorControls.tsx';
import { DrawControlFooter } from '../DrawControlsFooter.tsx';
import { DrawToolSelector } from '../DrawToolSelector.tsx';
import { LineWidthControl } from '../LineWidthControl.tsx';
import { MeasurementControls } from '../MeasurementControls.tsx';
import { PointStyleSelector } from '../PointStyleSelector.tsx';
import { useDrawControlsKeyboardEffects } from './drawControlsKeyboardEffects.ts';
import { useDrawSettings } from './hooks/drawSettings.ts';

export const DrawControls = () => {
  const { drawType, deleteSelected } = useDrawSettings();
  const isMobile = useIsMobileScreen();
  const { t } = useTranslation();

  useDrawControlsKeyboardEffects();

  return (
    <VStack alignItems={'flex-start'} width={'100%'}>
      <DrawToolSelector />
      <ColorControls />
      {drawType === 'Point' && <PointStyleSelector />}
      {isMobile && drawType == 'Move' && (
        <Button onClick={deleteSelected}>{t('draw.deleteSelection')}</Button>
      )}
      <LineWidthControl />
      <MeasurementControls />
      <DrawControlFooter />
    </VStack>
  );
};
