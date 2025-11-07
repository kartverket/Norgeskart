import { Button, Flex } from '@kvib/react';
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
    <Flex flexDirection="column">
      <DrawToolSelector />
      {drawType === 'Text' && <TextStyleControl />}
      <EditControls />
      <ColorControls />
      {drawType === 'Point' && <PointStyleSelector />}
      {isMobile && drawType == 'Move' && (
        <Button onClick={deleteSelected}>{t('draw.deleteSelection')}</Button>
      )}
      <LineWidthControl />
      <MeasurementControls />
      <DrawControlFooter />
    </Flex>
  );
};
