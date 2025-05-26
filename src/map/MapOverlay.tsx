import {
  Box,
  Button,
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
  VStack,
} from '@kvib/react';
import { Fill, Stroke } from 'ol/style';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import { DrawType, useMapSettings } from './mapHooks';

const drawTypeCollection: { value: DrawType; label: string }[] = [
  { value: 'Point', label: 'Punkt' },
  { value: 'LineString', label: 'Linje' },
  { value: 'Polygon', label: 'Polygon' },
  { value: 'Circle', label: 'Sirkel' },
];

export const MapOverlay = () => {
  const { drawEnabled, drawStyle, setDrawType, toggleDrawEnabled, setDrawStyle } =
    useMapSettings();
const styleColorString = drawStyle.getFill()?.getColor()?.toString()
const fillColor = parseColor(styleColorString? styleColorString : '#000000');
   
  return (
    <>
      <Box position="absolute" bottom="16px" left="16px" zIndex={10}>
        <a
          href="https://www.kartverket.no"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/logos/KV_logo_staa.svg"
            alt="Logo"
            style={{ height: 64 }}
          />
        </a>
      </Box>
      <Box position={'absolute'} top={'16px'} right={'16px'}>
        <VStack
          backgroundColor={'rgba(255, 255, 255, 0.6)'}
          padding={4}
          borderRadius={'8px'}
        >
          <Button
            onClick={toggleDrawEnabled}
            leftIcon={drawEnabled ? 'close' : 'draw'}
            variant="primary"
          >
            {drawEnabled ? 'Ferdig å tegne' : 'Tegn på kartet'}
          </Button>
          {drawEnabled && (
            <>
              <SelectRoot
                collection={createListCollection({
                  items: drawTypeCollection,
                })}
              >
                <SelectLabel>Tegneverktøy:</SelectLabel>
                <SelectTrigger>
                  <SelectValueText placeholder={'Velg bakgrunnskart'} />
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
                value={fillColor}
                defaultValue={fillColor}             
                onValueChange={(value) => {
                  value.value;
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
                <ColorPickerLabel>Velg farge</ColorPickerLabel>
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
          )}
        </VStack>
      </Box>
    </>
  );
};
