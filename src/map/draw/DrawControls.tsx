import {
  Button,
  ButtonGroup,
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
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  VStack,
} from '@kvib/react';
import { useState } from 'react';
import { DrawType, useMapSettings } from '../mapHooks';

export const DrawControls = () => {
  const {
    drawEnabled,
    toggleDrawEnabled,
    setDrawType,
    drawFillColor,
    drawStrokeColor,
    setDrawFillColor,
    setDrawStrokeColor,
    clearDrawing,
  } = useMapSettings();

  const [clearPopoverOpen, setClearPopoverOpen] = useState(false);

  const drawTypeCollection: { value: DrawType; label: string }[] = [
    { value: 'Point', label: 'Punkt' },
    { value: 'LineString', label: 'Linje' },
    { value: 'Polygon', label: 'Polygon' },
    { value: 'Circle', label: 'Sirkel' },
  ];

  return (
    <VStack>
      <Button onClick={() => toggleDrawEnabled()}>
        {drawEnabled ? 'Ferdig' : 'Tegn på kartet'}
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
              setDrawFillColor(value.valueAsString);
            }}
          >
            {/*TODO: Gjør hilke velgere som er synlig avhengig av hvilket verktøy som er valgt  */}
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
              setDrawStrokeColor(value.valueAsString);
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
      )}
      <ButtonGroup>
        <PopoverRoot
          open={clearPopoverOpen}
          onOpenChange={(e) => setClearPopoverOpen(e.open)}
        >
          <PopoverTrigger asChild>
            <Button colorPalette={'red'}>Fjern tegning</Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody>
              <PopoverTitle fontWeight="bold">Er du sikker?</PopoverTitle>

              <Button
                onClick={() => {
                  setClearPopoverOpen(false);
                  clearDrawing();
                }}
                colorPalette={'red'}
              >
                Ja
              </Button>
            </PopoverBody>
          </PopoverContent>
        </PopoverRoot>

        <Button
          onClick={() => {
            alert('Denne gjør ingenting');
          }}
        >
          Lagre
        </Button>
      </ButtonGroup>
    </VStack>
  );
};
