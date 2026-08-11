import { Box, Heading, HStack, VStack } from '@kvib/react';
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

  const getButtonSize = (value: number) => {
    return value === 2 ? 24 : value === 4 ? 30 : 36;
  };

  const getPointSize = (value: number) => value * 2.2;

  return (
    <VStack align="stretch" paddingY={2}>
      <Heading size={{ base: 'xs', md: 'sm' }}>
        {isPoint ? t('draw.size.pointLabel') : t('draw.size.label')}
      </Heading>
      <HStack>
        {lineWidthCollection.map((item) => {
          const isSelected = lineWidth === item.value;
          const buttonSize = getButtonSize(item.value);
          const pointSize = getPointSize(item.value);

          return (
            <Box
              key={item.value}
              as="button"
              onClick={() => setLineWidth(item.value)}
              aria-pressed={isSelected}
              aria-label={`${t('draw.size.label')} ${item.label}`}
              w={`${buttonSize}px`}
              h={`${buttonSize}px`}
              borderRadius="full"
              borderWidth="1px"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              borderColor="green.500"
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
                  w="80%"
                  h={`${item.value}px`}
                  borderRadius="full"
                  bg="green.500"
                />
              )}
            </Box>
          );
        })}
      </HStack>
    </VStack>
  );
};
