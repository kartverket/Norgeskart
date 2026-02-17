import { Flex, Heading, HStack, IconButton, VStack } from '@kvib/react';
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

const MOBILE_TOOLBAR_RESERVE = '55px';

export const DrawControls = () => {
  const { drawType, deleteSelected } = useDrawSettings();
  const isMobile = useIsMobileScreen();
  const { t } = useTranslation();

  const drawTypeLabels: Record<string, string> = {
    Move: t('draw.controls.tool.tooltip.edit'),
    Polygon: t('draw.controls.tool.tooltip.polygon'),
    Point: t('draw.controls.tool.tooltip.point'),
    LineString: t('draw.controls.tool.tooltip.linestring'),
    Circle: t('draw.controls.tool.tooltip.circle'),
    Text: t('draw.controls.tool.tooltip.text'),
  };

  const activeToolLabel = drawType
    ? drawTypeLabels[drawType]
    : t('draw.tabHeading');

  useDrawControlsKeyboardEffects();
  useAtom(distanceUnitAtomEffect);

  return (
    <VStack
      alignItems="flex-start"
      width="100%"
      padding={0.5}
      style={isMobile ? { paddingBottom: MOBILE_TOOLBAR_RESERVE } : undefined}
    >
      {isMobile && (
        <Heading size="md" px={1} py={1}>
          {activeToolLabel}
        </Heading>
      )}

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
  );
};
