import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerControl,
  ColorPickerEyeDropper,
  ColorPickerInput,
  ColorPickerLabel,
  ColorPickerSliders,
  ColorPickerTrigger,
  HStack,
  parseColor,
} from '@kvib/react';
import { t } from 'i18next';
import { useDrawSettings } from './drawHooks';

export const ColorControls = () => {
  const {
    drawTypeState,
    drawFillColor,
    drawStrokeColor,
    setDrawFillColor,
    setDrawStrokeColor,
  } = useDrawSettings();

  return (
    <>
      {(drawTypeState == 'Circle' || drawTypeState == 'Polygon') && (
        <ColorPicker
          value={parseColor(drawFillColor)}
          defaultValue={parseColor(drawFillColor)}
          onValueChange={(value) => {
            setDrawFillColor(value.valueAsString);
          }}
        >
          <ColorPickerLabel>{t('draw.controls.colorFill')}</ColorPickerLabel>
          <ColorPickerControl>
            <ColorPickerInput />
            <ColorPickerTrigger />
          </ColorPickerControl>
          <ColorPickerContent>
            <ColorPickerArea />
            <HStack>
              <ColorPickerEyeDropper />
              <ColorPickerSliders />
            </HStack>
          </ColorPickerContent>
        </ColorPicker>
      )}
      {(drawTypeState == 'Circle' ||
        drawTypeState == 'Polygon' ||
        drawTypeState == 'LineString') && (
        <ColorPicker
          value={parseColor(drawStrokeColor)}
          defaultValue={parseColor(drawStrokeColor)}
          onValueChange={(value) => {
            setDrawStrokeColor(value.valueAsString);
          }}
        >
          <ColorPickerLabel>{t('draw.controls.colorStroke')}</ColorPickerLabel>
          <ColorPickerControl>
            <ColorPickerInput />
            <ColorPickerTrigger />
          </ColorPickerControl>
          <ColorPickerContent>
            <ColorPickerArea />
            <HStack>
              <ColorPickerEyeDropper />
              <ColorPickerSliders />
            </HStack>
          </ColorPickerContent>
        </ColorPicker>
      )}
    </>
  );
};
