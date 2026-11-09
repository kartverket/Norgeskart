import { Box, Flex, HStack, Text, VStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
  const showLineWidthControl =
    currentType === 'LineString' ||
    currentType === 'Point' ||
    currentType === 'Polygon';

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
          {t('draw.controls.editInstruction')}
        </Text>
      )}

      {currentType === 'Text' && <TextStyleControl />}

      {currentType && (
        <Box
          width="100%"
          border="1px solid"
          borderColor="#E0E0E0"
          borderRadius="8px"
          backgroundColor="white"
          boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
          padding={2}
        >
          <VStack width="100%" gap={0} alignItems="stretch">
            <Box width="100%" pb={2} borderBottom="1px solid #E0E0E0">
              <HStack width="100%" align={'space-between'}>
                <ColorControls />

                {currentType === 'Point' && <PointStyleSelector />}
                {isMobile && drawType === 'LineString' && <LineStyleControl />}
              </HStack>
            </Box>

            {!isMobile && drawType === 'LineString' && (
              <Box
                width="100%"
                py={2}
                borderBottom="1px solid #E0E0E0"
              >
                <LineStyleControl />
              </Box>
            )}

            {showLineWidthControl && (
              <Box
                width="100%"
                py={2}
                borderBottom="1px solid #E0E0E0"
              >
                <LineWidthControl />
              </Box>
            )}

            {showMeasurementControls && (
              <Box
                width="100%"
                py={2}
                borderBottom="1px solid #E0E0E0"
              >
                <MeasurementControls />
              </Box>
            )}

            <Box width="100%" pt={1}>
              <EditControls drawType={drawType} />
            </Box>
          </VStack>
        </Box>
      )}
      <DrawControlFooter />
    </VStack>
  );
};
