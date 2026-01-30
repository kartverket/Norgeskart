import { Flex, HStack, IconButton, VStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { useIsMobileScreen } from '../../shared/hooks.ts';
import { BottomDrawToolSelector } from '../BottomDrawToolSelector.tsx';
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

const MOBILE_TOOLBAR_RESERVE = '55px'; // juster etter behov

export const DrawControls = () => {
  const { drawType, deleteSelected } = useDrawSettings();
  const isMobile = useIsMobileScreen();

  useDrawControlsKeyboardEffects();
  useAtom(distanceUnitAtomEffect);

  return (
    <>
      <VStack
        alignItems="flex-start"
        width="100%"
        padding={0.5}
        // sørger for at innhold ikke havner bak bottom-bar
        style={isMobile ? { paddingBottom: MOBILE_TOOLBAR_RESERVE } : undefined}
      >
        {/* Desktop: selector øverst. Mobil: den ligger fixed i bunnen */}
        {!isMobile && <DrawToolSelector />}

        {drawType === 'Text' && <TextStyleControl />}

        <HStack width="100%">
          <ColorControls />
          {drawType === 'Point' && <PointStyleSelector />}
        </HStack>

        {isMobile && drawType === 'Move' && (
          <IconButton
            onClick={deleteSelected}
            colorPalette="red"
            icon="delete"
            size="md"
            variant="ghost"
          />
        )}
        <Flex
          w="100%"
          alignItems="flex-start"
          flexDirection={{ base: 'row', md: 'column' }}
          justifyContent="space-between"
          py={1}
        >
          <LineWidthControl />
          <MeasurementControls />
        </Flex>

        <EditControls />
        <DrawControlFooter />
      </VStack>

      {isMobile && <BottomDrawToolSelector />}
    </>
  );
};
