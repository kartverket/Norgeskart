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
  createListCollection,
  HStack,
  parseColor,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@kvib/react';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { DrawType, useMapSettings } from '../mapHooks';

export const DrawControls = () => {
  const { setDrawType, drawFillColor, drawStrokeColor, setDrawStyle } =
    useMapSettings();

  const drawTypeCollection: { value: DrawType; label: string }[] = [
    { value: 'Point', label: 'Punkt' },
    { value: 'LineString', label: 'Linje' },
    { value: 'Polygon', label: 'Polygon' },
    { value: 'Circle', label: 'Sirkel' },
  ];
  return (
    <>
      <SelectRoot
        collection={createListCollection({
          items: drawTypeCollection,
        })}
      >
        <SelectLabel>Tegneverktøy:</SelectLabel>
        <SelectTrigger>
          <SelectValueText placeholder={'Velg tegneform'} />
        </SelectTrigger>
        <SelectContent>
          {drawTypeCollection.map((item) => (
            <SelectItem
              key={item.value}
              item={item.value}
              onClick={() => setDrawType(item.value as DrawType)}
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
      <ColorPicker
        value={parseColor(drawFillColor)}
        defaultValue={parseColor(drawFillColor)}
        onValueChange={(value) => {
          const style = new Style({
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({
                color: value.valueAsString,
              }),
              stroke: new Stroke({
                color: value.valueAsString,
                width: 2,
              }),
            }),
            stroke: new Stroke({
              color: value.valueAsString,
              width: 2,
            }),
            fill: new Fill({
              color: value.valueAsString,
            }),
          });
          setDrawStyle(style);
        }}
      >
        <ColorPickerLabel>Velg fyllfarge</ColorPickerLabel>
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
      <ColorPicker
        value={parseColor(drawStrokeColor)}
        defaultValue={parseColor(drawStrokeColor)}
        onValueChange={(value) => {
          const style = new Style({
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({
                color: value.valueAsString,
              }),
              stroke: new Stroke({
                color: value.valueAsString,
                width: 2,
              }),
            }),
            stroke: new Stroke({
              color: value.valueAsString,
              width: 2,
            }),
            fill: new Fill({
              color: value.valueAsString,
            }),
          });
          setDrawStyle(style);
        }}
      >
        <ColorPickerLabel>Velg omrissfarge</ColorPickerLabel>

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
    </>
  );
};
