import { Flex, HStack, Text, VStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import {
  clearInteractions,
  drawEnabledEffect,
  drawTypeEffect,
  selectedFeatureAtom,
  snapEffect,
} from '../../settings/draw/atoms.ts';
import { useIsMobileScreen } from '../../shared/hooks.ts';
import { ColorControls } from '../ColorControls.tsx';
import { DrawControlFooter } from '../DrawControlsFooter.tsx';
import { DrawToolSelector } from '../DrawToolSelector.tsx';
import {
  distanceUnitAtomEffect,
  drawStyleEffect,
  editPointIconEffect,
  editPrimaryColorEffect,
  editSecondaryColorEffect,
  editTextEffect,
  lineWidthEffect,
} from '../effects.ts';
import { LineStyleControl } from '../LineStyleControl.tsx';
import { LineWidthControl } from '../LineWidthControl.tsx';
import { MeasurementControls } from '../MeasurementControls.tsx';
import { PointStyleSelector } from '../PointStyleSelector.tsx';
import { TextStyleControl } from '../TextStyleControl.tsx';
import { useDrawControlsKeyboardEffects } from './drawControlsKeyboardEffects.ts';
import { getFeatureType } from './drawUtils.ts';
import { EditControls } from './EditControls.tsx';
import { DrawType, useDrawSettings } from './hooks/drawSettings.ts';

const MOBILE_TOOLBAR_RESERVE = '15px';

const MEASUREMENT_TYPES: DrawType[] = [
  'LineString',
  'Polygon',
  'Circle',
  'Move',
];

export const DrawControls = () => {
  const { drawType } = useDrawSettings();
  const [selectedFeature] = useAtom(selectedFeatureAtom);
  const isMobile = useIsMobileScreen();
  useAtom(drawEnabledEffect);
  useAtom(drawTypeEffect);
  useAtom(distanceUnitAtomEffect);
  useAtom(snapEffect);
  useAtom(drawStyleEffect);
  useAtom(editPrimaryColorEffect);
  useAtom(editSecondaryColorEffect);
  useAtom(lineWidthEffect);
  useAtom(editTextEffect);
  useAtom(editPointIconEffect);

  useDrawControlsKeyboardEffects();
  useEffect(() => {
    return () => {
      clearInteractions();
    };
  }, []);

  const selectedFeatureType = selectedFeature
    ? getFeatureType(selectedFeature)
    : null;

  const currentType = drawType === 'Move' ? selectedFeatureType : drawType;

  const showMeasurementControls =
    drawType !== 'Move' &&
    currentType != null &&
    MEASUREMENT_TYPES.includes(currentType);

  return (
    <VStack
      alignItems="flex-start"
      width="100%"
      padding={0.5}
      style={isMobile ? { paddingBottom: MOBILE_TOOLBAR_RESERVE } : undefined}
    >
      {!isMobile && <DrawToolSelector />}

      {drawType === 'Move' && !selectedFeature && (
        <Text fontSize="md" mt={4}>
          Velg et element du vil redigere eller flytte
        </Text>
      )}

      {currentType === 'Text' && <TextStyleControl />}

      <HStack width="100%" align={'space-between'}>
        {currentType && <ColorControls />}

        {currentType === 'Point' && <PointStyleSelector />}
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
        {showMeasurementControls && <MeasurementControls />}
      </Flex>
      <EditControls drawType={drawType} />
      <DrawControlFooter />
    </VStack>
  );
};
