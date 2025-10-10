import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerControl,
  ColorPickerInput,
  ColorPickerLabel,
  ColorPickerSliders,
  ColorPickerTrigger,
  parseColor,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { primaryColorAtom, secondaryColorAtom } from '../settings/draw/atoms';
import { useDrawSettings } from './drawControls/hooks/drawSettings';

export const ColorControls = () => {
  const [primaryColor, setPrimaryColor] = useAtom(primaryColorAtom);
  const [secondaryColor, setSecondaryColor] = useAtom(secondaryColorAtom);

  const { drawType } = useDrawSettings(); //TODO får hvilke som er synlige bettinget igjen

  return (
    <>
      <SingleColorControl
        label={'hoved'} //TODO FIx
        color={primaryColor}
        onSetColor={setPrimaryColor}
      />

      <SingleColorControl
        label={'sekundær'} //TODO FIx
        color={secondaryColor}
        onSetColor={setSecondaryColor}
      />
    </>
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
        <ColorPickerInput />
        <ColorPickerTrigger />
      </ColorPickerControl>
      <ColorPickerContent>
        <ColorPickerArea />
        <ColorPickerSliders />
      </ColorPickerContent>
    </ColorPicker>
  );
};
