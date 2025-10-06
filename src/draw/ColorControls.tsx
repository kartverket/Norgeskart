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
import { primaryColorAtom, secondaryColorAtom } from '../settings/draw/atoms';
import { useDrawSettings } from './drawHooks';

export const ColorControls = () => {
  const [primaryColor, setPrimaryColor] = useAtom(primaryColorAtom);
  const [secondaryColor, setSecondaryColor] = useAtom(secondaryColorAtom);

  const { drawType } = useDrawSettings();

  return (
    <>
      {(drawType == 'Circle' ||
        drawType == 'Polygon' ||
        drawType === 'Text') && (
        <ColorPicker
          value={parseColor(primaryColor)}
          onValueChange={(value) => {
            setPrimaryColor(value.valueAsString);
          }}
        >
          <ColorPickerLabel>
            {drawType === 'Text'
              ? t('draw.controls.textColor')
              : t('draw.controls.colorFill')}
          </ColorPickerLabel>
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
      {(drawType == 'Circle' ||
        drawType == 'Polygon' ||
        drawType == 'LineString' ||
        drawType === 'Text') && (
        <ColorPicker
          value={parseColor(secondaryColor)}
          onValueChange={(value) => {
            setSecondaryColor(value.valueAsString);
          }}
        >
          <ColorPickerLabel>
            {drawType === 'Text'
              ? t('draw.controls.backgroundColor')
              : t('draw.controls.colorStroke')}
          </ColorPickerLabel>
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
      {drawType == 'Point' && (
        <ColorPicker
          value={parseColor(secondaryColor)}
          onValueChange={(value) => {
            setSecondaryColor(value.valueAsString);
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
    </>
  );
};
