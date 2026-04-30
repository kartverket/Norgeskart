import { Flex, HStack, VStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import {
  clearInteractions,
  drawEnabledEffect,
  drawTypeEffect,
  snapEffect,
} from '../../settings/draw/atoms.ts';
import { useIsMobileScreen } from '../../shared/hooks.ts';
import { ColorControls } from '../ColorControls.tsx';
import { DrawControlFooter } from '../DrawControlsFooter.tsx';
import { DrawToolSelector } from '../DrawToolSelector.tsx';
import {
  distanceUnitAtomEffect,
  drawStyleEffect,
  editPrimaryColorEffect,
  editSecondaryColorEffect,
  lineWidthEffect,
} from '../effects.ts';
import { LineStyleControl } from '../LineStyleControl.tsx';
import { LineWidthControl } from '../LineWidthControl.tsx';
import { MeasurementControls } from '../MeasurementControls.tsx';
import { PointStyleSelector } from '../PointStyleSelector.tsx';
import { TextStyleControl } from '../TextStyleControl.tsx';
import { useDrawControlsKeyboardEffects } from './drawControlsKeyboardEffects.ts';
import { EditControls } from './EditControls.tsx';
import { useDrawSettings } from './hooks/drawSettings.ts';

const MOBILE_TOOLBAR_RESERVE = '15px';

export const DrawControls = () => {
  const { drawType } = useDrawSettings();
  const isMobile = useIsMobileScreen();
  useAtom(drawEnabledEffect);
  useAtom(drawTypeEffect);
  useAtom(distanceUnitAtomEffect);
  useAtom(snapEffect);
  useAtom(drawStyleEffect);
  useAtom(editPrimaryColorEffect);
  useAtom(editSecondaryColorEffect);
  useAtom(lineWidthEffect);

  useDrawControlsKeyboardEffects();
  useEffect(() => {
    return () => {
      clearInteractions();
    };
  }, []);

  return (
    <VStack
      alignItems="flex-start"
      width="100%"
      padding={0.5}
      style={isMobile ? { paddingBottom: MOBILE_TOOLBAR_RESERVE } : undefined}
    >
      {!isMobile && <DrawToolSelector />}

      {drawType === 'Text' && <TextStyleControl />}

      <HStack width="100%" align={'space-between'}>
        <ColorControls />
        {drawType === 'Point' && <PointStyleSelector />}
        {isMobile && drawType === 'LineString' && <LineStyleControl />}
      </HStack>
      <Flex
        w="100%"
        alignItems="flex-start"
        flexDirection={{ base: 'row', md: 'column' }}
        justifyContent="space-between"
        py={1}
      >
        {!isMobile && drawType === 'LineString' && <LineStyleControl />}
        <LineWidthControl />
        <MeasurementControls />
      </Flex>
      <EditControls />
      <DrawControlFooter />
    </VStack>
  );
};
