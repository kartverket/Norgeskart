import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerControl,
  ColorPickerLabel,
  ColorPickerSliders,
  ColorPickerTrigger,
  HStack,
  parseColor,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { primaryColorAtom, secondaryColorAtom } from '../settings/draw/atoms';
import { useDrawSettings } from './drawControls/hooks/drawSettings';

export const ColorControls = () => {
  const [primaryColor, setPrimaryColor] = useAtom(primaryColorAtom);
  const [secondaryColor, setSecondaryColor] = useAtom(secondaryColorAtom);
  const { primaryLabel, secondaryLabel } = useColorLabels();

  return (
    <HStack>
      <SingleColorControl
        label={primaryLabel}
        color={primaryColor}
        onSetColor={setPrimaryColor}
      />

      {secondaryLabel && (
        <SingleColorControl
          label={secondaryLabel}
          color={secondaryColor}
          onSetColor={setSecondaryColor}
        />
      )}
    </HStack>
  );
};

const SingleColorControl = ({
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
      onValueChange={(value) => {
        onSetColor(value.valueAsString);
      }}
    >
      <ColorPickerLabel>{label}</ColorPickerLabel>
      <ColorPickerControl>
        <ColorPickerTrigger />
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
  const colorLabelKeyPrefix = 'draw.controls.';

  switch (drawType) {
    case 'Text':
      return {
        primaryLabel: t(colorLabelKeyPrefix + 'colorText'),
        secondaryLabel: t(colorLabelKeyPrefix + 'colorBackground'),
      };
    case 'Point':
      return {
        primaryLabel: t(colorLabelKeyPrefix + 'colorPoint'),
        secondaryLabel: null,
      };
    case 'LineString':
      return {
        primaryLabel: t(colorLabelKeyPrefix + 'colorStroke'),
        secondaryLabel: null,
      };
    case 'Polygon':
      return {
        primaryLabel: t(colorLabelKeyPrefix + 'colorStroke'),
        secondaryLabel: t(colorLabelKeyPrefix + 'colorFill'),
      };
    case 'Circle':
      return {
        primaryLabel: t(colorLabelKeyPrefix + 'colorStroke'),
        secondaryLabel: t(colorLabelKeyPrefix + 'colorFill'),
      };

    default:
      return {
        primaryLabel: 'Primary color',
        secondaryLabel: 'Secondary color',
      };
  }
};
