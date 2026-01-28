import {
  Box,
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerControl,
  ColorPickerSliders,
  ColorPickerTrigger,
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
import { useDrawSettings } from './drawControls/hooks/drawSettings';

export const ColorControls = () => {
  const [primaryColor, setPrimaryColor] = useAtom(primaryColorAtom);
  const [secondaryColor, setSecondaryColor] = useAtom(secondaryColorAtom);
  const { primaryLabel, secondaryLabel } = useColorLabels();
  const { t } = useTranslation();

  return (
    <VStack align="stretch" width="100%" paddingTop={3}>
      <Text fontWeight="semibold">{t('draw.controls.color')}</Text>

      <ColorRow
        label={primaryLabel}
        color={primaryColor}
        onSetColor={setPrimaryColor}
      />

      {secondaryLabel && (
        <ColorRow
          label={secondaryLabel}
          color={secondaryColor}
          onSetColor={setSecondaryColor}
        />
      )}
    </VStack>
  );
};

const ColorRow = ({
  label,
  color,
  onSetColor,
}: {
  label: string;
  color: string;
  onSetColor: (v: string) => void;
}) => {
  return (
    <ColorPicker
      value={parseColor(color)}
      onValueChange={(value) => onSetColor(value.valueAsString)}
    >
      <ColorPickerControl>
        <ColorPickerTrigger asChild>
          <HStack
            w="100%"
            role="button"
            tabIndex={0}
            align="center"
            py={1}
            borderWidth="1px"
            borderRadius="lg"
            bg="white"
            cursor="pointer"
            _hover={{ bg: 'gray.50' }}
          >
            <Swatch color={color} />
            <Text>{label}</Text>
            <Spacer />
            <Icon
              color="colorPalette.500"
              grade={0}
              icon="chevron_right"
              size={28}
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

const Swatch = ({ color }: { color: string }) => {
  return (
    <Box
      w="25px"
      h="25px"
      borderRadius="sm"
      borderWidth="1px"
      style={{ background: color }}
    />
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
