import { Box, Heading, HStack, Text, VStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { LineWidth, lineWidthAtom } from '../settings/draw/atoms';
import { useDrawSettings } from './drawControls/hooks/drawSettings';

const lineWidthCollection: { value: LineWidth; label: string }[] = [
  { value: 2, label: 'S' },
  { value: 4, label: 'M' },
  { value: 8, label: 'L' },
];

export const LineWidthControl = () => {
  const [lineWidth, setLineWidth] = useAtom(lineWidthAtom);
  const { drawType } = useDrawSettings();
  const { t } = useTranslation();

  if (
    drawType !== 'LineString' &&
    drawType !== 'Point' &&
    drawType !== 'Polygon' &&
    drawType !== 'Move'
  ) {
    return null;
  }

  return (
    <VStack align="stretch">
      <Heading size={{ base: 'sm', md: 'md' }}>{t('draw.size.label')}</Heading>

      <HStack>
        {lineWidthCollection.map((item) => {
          const isSelected = lineWidth === item.value;

          return (
            <Box
              key={item.value}
              as="button"
              onClick={() => setLineWidth(item.value)}
              aria-pressed={isSelected}
              aria-label={`${t('draw.size.label')} ${item.label}`}
              w={{ base: '20px', md: '32px' }}
              h={{ base: '20px', md: '32px' }}
              borderRadius="full"
              borderWidth="1px"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              bg={isSelected ? 'colorPalette.500' : 'white'}
              color={isSelected ? 'white' : 'inherit'}
              borderColor={isSelected ? 'colorPalette.500' : 'gray.300'}
              _hover={{ bg: isSelected ? 'colorPalette.600' : 'gray.50' }}
              _active={{ transform: 'scale(0.98)' }}
            >
              <Text fontSize="sm" fontWeight="semibold">
                {item.label}
              </Text>
            </Box>
          );
        })}
      </HStack>
    </VStack>
  );
};
