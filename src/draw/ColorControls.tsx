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
import { useEffect, useState } from 'react';
import { useDrawSettings } from './drawHooks';

export const DEFAULT_PRIMARY_COLOR = '#000000';
export const DEFAULT_SECONDARY_COLOR = '#ffffff';

export const ColorControls = () => {
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY_COLOR);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY_COLOR);

  const {
    drawTypeState,
    setDrawFillColor,
    setDrawStrokeColor,
    setDrawPointColor,
  } = useDrawSettings();

  useEffect(() => {
    if (drawTypeState == 'Point') {
      setDrawPointColor(primaryColor);
    } else {
      setDrawFillColor(primaryColor);
    }
    return () => {
      setDrawFillColor(DEFAULT_PRIMARY_COLOR);
      setDrawPointColor(DEFAULT_PRIMARY_COLOR);
    };
  }, [primaryColor, drawTypeState]);

  useEffect(() => {
    setDrawStrokeColor(secondaryColor);
    return () => {
      setDrawStrokeColor(DEFAULT_SECONDARY_COLOR);
    };
  }, [secondaryColor, drawTypeState]);

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
            <HStack>
              <ColorPickerEyeDropper />
              <ColorPickerSliders />
            </HStack>
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
