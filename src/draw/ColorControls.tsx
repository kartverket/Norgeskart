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
  SimpleGrid,
  Text,
  VStack,
} from '@kvib/react';
import { t } from 'i18next';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  primaryColorAtom,
  recentColorsAtom,
  secondaryColorAtom,
  selectedFeatureAtom,
} from '../settings/draw/atoms';
import { useIsMobileScreen } from '../shared/hooks';
import { getFeatureType } from './drawControls/drawUtils';
import { useDrawSettings } from './drawControls/hooks/drawSettings';

export const ColorControls = () => {
  const [primaryColor, setPrimaryColor] = useAtom(primaryColorAtom);
  const [secondaryColor, setSecondaryColor] = useAtom(secondaryColorAtom);
  const [selectedFeature] = useAtom(selectedFeatureAtom);
  const { drawType } = useDrawSettings();
  const { t } = useTranslation();
  const isMobile = useIsMobileScreen();

  const selectedFeatureType = selectedFeature
    ? getFeatureType(selectedFeature)
    : null;

  const currentType = drawType === 'Move' ? selectedFeatureType : drawType;

  const { primaryLabel, secondaryLabel } = useColorLabels(currentType);

  return (
    <HStack align="center" justifyContent="space-between" w="100%">
      <Heading fontWeight="semibold" size={{ base: 'xs', md: 'sm' }}>
        {t('draw.controls.color')}
      </Heading>

      <Box flex="1" display="flex" justifyContent="flex-end">
        {isMobile ? (
          <HStack flexWrap="wrap" gap={2} align="stretch">
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
          <HStack align="stretch" gap={1}>
            <Box>
              <ColorRow
                isMobile={false}
                label={primaryLabel}
                color={primaryColor}
                onSetColor={setPrimaryColor}
              />
            </Box>

            {secondaryLabel && (
              <Box>
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
      </Box>
    </HStack>
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
  const [recentColors, setRecentColors] = useAtom(recentColorsAtom);

  return (
    <ColorPicker
      value={parseColor(color)}
      onValueChange={(value) => onSetColor(value.valueAsString)}
      onValueChangeEnd={(value) => {
        const finalColor = value.valueAsString;
        setRecentColors((prev) => addRecentColor(prev, finalColor));
      }}
    >
      <ColorPickerControl>
        <ColorPickerTrigger asChild>
          <HStack
            w="auto"
            maxW="120px"
            marginLeft="auto"
            role="button"
            tabIndex={0}
            align="center"
            gap={1}
            py={0.5}
            px={1}
            border="none"
            borderRadius="md"
            bg="transparent"
            boxShadow="none"
            cursor="pointer"
            _hover={{ bg: 'gray.50' }}
          >
            <ColorPickerSwatch value={color} boxSize="3" borderRadius="full" />
            <Text fontSize={{ base: 'xs', md: 'sm' }}>{label}</Text>
            <Icon
              color="colorPalette.500"
              grade={0}
              icon="chevron_right"
              size={isMobile ? 16 : 18}
              weight={300}
            />
          </HStack>
        </ColorPickerTrigger>
      </ColorPickerControl>

      <ColorPickerContent>
        <ColorPickerArea />
        <ColorPickerSliders />
        {recentColors.length > 0 && (
          <VStack align="start" mt={2} gap={1}>
            <Text fontSize="xs">{t('draw.controls.recentColors')}</Text>

            <SimpleGrid mt={1} columns={8} gap={1}>
              {recentColors.map((c) => (
                <ColorPickerSwatch
                  key={c}
                  value={c}
                  onClick={() => onSetColor(c)}
                  style={{ cursor: 'pointer' }}
                  boxSize="5"
                />
              ))}
            </SimpleGrid>
          </VStack>
        )}
      </ColorPickerContent>
    </ColorPicker>
  );
};

const addRecentColor = (list: string[], color: string) => {
  const updated = list.filter((c) => c !== color);
  updated.unshift(color);
  return updated.slice(0, 16);
};

const useColorLabels = (drawType: string | null) => {
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
      return { primaryLabel: t(p + 'defaults.primary'), secondaryLabel: null };
    case 'Polygon':
    case 'Circle':
      return {
        primaryLabel: t(p + 'colorStroke'),
        secondaryLabel: t(p + 'colorFill'),
      };
    default:
      return {
        primaryLabel: t(p + 'defaults.primary'),
        secondaryLabel: t(p + 'defaults.secondary'),
      };
  }
};
