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
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SECONDARY_COLOR,
  primaryColorAtom,
  secondaryColorAtom,
} from '../map/atoms';
import { useDrawSettings } from './drawHooks';

export const ColorControls = () => {
  const [primaryColor, setPrimaryColor] = useAtom(primaryColorAtom);
  const [secondaryColor, setSecondaryColor] = useAtom(secondaryColorAtom);

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
  }, [primaryColor, drawTypeState, setDrawPointColor, setDrawFillColor]);

  useEffect(() => {
    setDrawStrokeColor(secondaryColor);
    return () => {
      setDrawStrokeColor(DEFAULT_SECONDARY_COLOR);
    };
  }, [secondaryColor, drawTypeState, setDrawStrokeColor]);

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
