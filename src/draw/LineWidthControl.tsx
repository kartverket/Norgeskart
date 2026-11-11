import { Box, Heading, HStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  LineWidth,
  lineWidthAtom,
  selectedFeatureAtom,
} from '../settings/draw/atoms';
import { getFeatureType } from './drawControls/drawUtils';
import { useDrawSettings } from './drawControls/hooks/drawSettings';

const lineWidthCollection: { value: LineWidth; label: string }[] = [
  { value: 2, label: 'S' },
  { value: 4, label: 'M' },
  { value: 8, label: 'L' },
];

export const LineWidthControl = () => {
  const [lineWidth, setLineWidth] = useAtom(lineWidthAtom);
  const [selectedFeature] = useAtom(selectedFeatureAtom);

  const { drawType } = useDrawSettings();
  const { t } = useTranslation();
  const selectedFeatureType = selectedFeature
    ? getFeatureType(selectedFeature)
    : null;

  const currentType = drawType === 'Move' ? selectedFeatureType : drawType;

  if (
    currentType !== 'LineString' &&
    currentType !== 'Point' &&
    currentType !== 'Polygon'
  ) {
    return null;
  }
  const isPoint = currentType === 'Point';

  const getPointSize = (value: number) => value * 1.8;

  return (
    <HStack align="center" justifyContent="space-between" width="100%">
      <Heading size={{ base: 'xs', md: 'sm' }}>
        {isPoint ? t('draw.size.pointLabel') : t('draw.size.label')}
      </Heading>
      <HStack gap={0}>
        {lineWidthCollection.map((item) => {
          const isSelected = lineWidth === item.value;
          const pointSize = getPointSize(item.value);

          return (
            <Box
              key={item.value}
              as="button"
              onClick={() => setLineWidth(item.value)}
              aria-pressed={isSelected}
              aria-label={`${t('draw.size.label')} ${item.label}`}
              w="36px"
              h="20px"
              borderRadius="4px"
              border="1px solid"
              borderColor={isSelected ? 'green.500' : 'gray.200'}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              bg={isSelected ? 'green.100' : 'transparent'}
            >
              {isPoint ? (
                <Box
                  w={`${pointSize}px`}
                  h={`${pointSize}px`}
                  borderRadius="full"
                  bg="green.500"
                />
              ) : (
                <Box
                  w="20px"
                  h={`${item.value}px`}
                  borderRadius="full"
                  bg="green.500"
                />
              )}
            </Box>
          );
        })}
      </HStack>
    </HStack>
  );
};
