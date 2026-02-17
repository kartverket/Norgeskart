import {
  Box,
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerControl,
  ColorPickerSliders,
  ColorPickerSwatch,
  ColorPickerTrigger,
  Heading,
  HStack,
  Icon,
  parseColor,
  Spacer,
  Text,
  VStack,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { primaryColorAtom, secondaryColorAtom } from '../settings/draw/atoms';
import { useIsMobileScreen } from '../shared/hooks';
import { useDrawSettings } from './drawControls/hooks/drawSettings';

export const ColorControls = () => {
  const [primaryColor, setPrimaryColor] = useAtom(primaryColorAtom);
  const [secondaryColor, setSecondaryColor] = useAtom(secondaryColorAtom);
  const { primaryLabel, secondaryLabel } = useColorLabels();
  const { t } = useTranslation();
  const isMobile = useIsMobileScreen();

  return (
    <VStack
      align="stretch"
      w="100%"
      mt={isMobile ? 1 : 2}
      gap={isMobile ? 1 : 2}
    >
      <Heading fontWeight="semibold" size={{ base: 'sm', md: 'md' }}>
        {t('draw.controls.color')}
      </Heading>

      {isMobile ? (
        <HStack w="100%" flexWrap="wrap" gap={2} align="stretch">
          <Box>
            <ColorRow
              isMobile={true}
              label={primaryLabel}
              color={primaryColor}
              onSetColor={setPrimaryColor}
            />
          </Box>

          {secondaryLabel && (
            <Box>
              <ColorRow
                isMobile={true}
                label={secondaryLabel}
                color={secondaryColor}
                onSetColor={setSecondaryColor}
              />
            </Box>
          )}
        </HStack>
      ) : (
        // Desktop: to like kolonner (som før)
        <HStack w="100%" align="stretch" gap={2}>
          <Box flex="1">
            <ColorRow
              isMobile={false}
              label={primaryLabel}
              color={primaryColor}
              onSetColor={setPrimaryColor}
            />
          </Box>

          {secondaryLabel && (
            <Box flex="1">
              <ColorRow
                isMobile={false}
                label={secondaryLabel}
                color={secondaryColor}
                onSetColor={setSecondaryColor}
              />
            </Box>
          )}
        </HStack>
      )}
    </VStack>
  );
};

const ColorRow = ({
  label,
  color,
  onSetColor,
  isMobile,
}: {
  label: string;
  color: string;
  onSetColor: (v: string) => void;
  isMobile: boolean;
}) => {
  return (
    <ColorPicker
      value={parseColor(color)}
      onValueChange={(value) => onSetColor(value.valueAsString)}
    >
      <ColorPickerControl>
        <ColorPickerTrigger asChild>
          <HStack
            w={isMobile ? 'auto' : '100%'}
            minW={isMobile ? '160px' : undefined}
            maxW={isMobile ? '220px' : undefined}
            role="button"
            tabIndex={0}
            align="center"
            py={isMobile ? 0.5 : 1}
            px={isMobile ? 2 : undefined}
            borderWidth="1px"
            borderRadius={isMobile ? 'md' : 'lg'}
            bg="white"
            cursor="pointer"
            _hover={{ bg: 'gray.50' }}
          >
            <ColorPickerSwatch value={color} />
            <Text fontSize="sm">{label}</Text>
            <Spacer />
            <Icon
              color="colorPalette.500"
              grade={0}
              icon="chevron_right"
              size={isMobile ? 24 : 28}
              weight={300}
            />
          </HStack>
        </ColorPickerTrigger>
      </ColorPickerControl>

      <ColorPickerContent>
        <ColorPickerArea />
        <ColorPickerSliders />
      </ColorPickerContent>
    </ColorPicker>
  );
};

const useColorLabels = () => {
  const { drawType } = useDrawSettings();
  const { t } = useTranslation();
  const p = 'draw.controls.';

  switch (drawType) {
    case 'Text':
      return {
        primaryLabel: t(p + 'colorText'),
        secondaryLabel: t(p + 'colorBackground'),
      };
    case 'Point':
      return { primaryLabel: t(p + 'colorPoint'), secondaryLabel: null };
    case 'LineString':
      return { primaryLabel: t(p + 'colorStroke'), secondaryLabel: null };
    case 'Polygon':
    case 'Circle':
      return {
        primaryLabel: t(p + 'colorStroke'),
        secondaryLabel: t(p + 'colorFill'),
      };
    default:
      return { primaryLabel: 'Primary', secondaryLabel: 'Secondary' };
  }
};
