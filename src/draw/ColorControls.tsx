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
import { t } from 'i18next';
import { useAtom } from 'jotai';
import { primaryColorAtom, secondaryColorAtom } from '../map/atoms';
import { useDrawSettings } from './drawHooks';

export const ColorControls = () => {
  const [primaryColor, setPrimaryColor] = useAtom(primaryColorAtom);
  const [secondaryColor, setSecondaryColor] = useAtom(secondaryColorAtom);

  const { drawTypeState } = useDrawSettings();

  return (
    <>
      {(drawTypeState == 'Circle' || drawTypeState == 'Polygon') && (
        <ColorPicker
          value={parseColor(primaryColor)}
          onValueChange={(value) => {
            setPrimaryColor(value.valueAsString);
          }}
        >
          <ColorPickerLabel>{t('draw.controls.colorFill')}</ColorPickerLabel>
          <ColorPickerControl>
            <ColorPickerInput />
            <ColorPickerTrigger />
          </ColorPickerControl>
          <ColorPickerContent>
            <ColorPickerArea />
            <ColorPickerSliders />
          </ColorPickerContent>
        </ColorPicker>
      )}
      {(drawTypeState == 'Circle' ||
        drawTypeState == 'Polygon' ||
        drawTypeState == 'LineString') && (
        <ColorPicker
          value={parseColor(secondaryColor)}
          onValueChange={(value) => {
            setSecondaryColor(value.valueAsString);
          }}
        >
          <ColorPickerLabel>{t('draw.controls.colorStroke')}</ColorPickerLabel>
          <ColorPickerControl>
            <ColorPickerInput />
            <ColorPickerTrigger />
          </ColorPickerControl>
          <ColorPickerContent>
            <ColorPickerArea />
            <ColorPickerSliders />
          </ColorPickerContent>
        </ColorPicker>
      )}
      {drawTypeState == 'Point' && (
        <ColorPicker
          value={parseColor(primaryColor)}
          onValueChange={(value) => {
            setPrimaryColor(value.valueAsString);
          }}
        >
          <ColorPickerLabel>{t('draw.controls.colorPoint')}</ColorPickerLabel>
          <ColorPickerControl>
            <ColorPickerInput />
            <ColorPickerTrigger />
          </ColorPickerControl>
          <ColorPickerContent>
            <ColorPickerArea />
            <ColorPickerSliders />
          </ColorPickerContent>
        </ColorPicker>
      )}
    </>
  );
};
