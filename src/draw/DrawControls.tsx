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
  SwitchControl,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
  VStack,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DrawType, useDrawSettings } from '../draw/drawHooks.ts';
import { DistanceUnit, distanceUnitAtom } from '../map/atoms.ts';
export const DrawControls = () => {
  const {
    drawEnabled,
    drawFillColor,
    drawStrokeColor,
    showMeasurements,
    setDrawEnabled,
    setDrawType,
    setDrawFillColor,
    setDrawStrokeColor,
    setShowMeasurements,
    clearDrawing,
    abortDrawing,
    setDrawLayerFeatures,
    refreshMeasurements,
    getDrawnFeatures,
  } = useDrawSettings();

  const { getMapProjectionCode } = useMapSettings();
  const { t } = useTranslation();

  const [clearPopoverOpen, setClearPopoverOpen] = useState(false);
  const [measurementUnit, setMeasurementUnit] = useAtom(distanceUnitAtom);
  const [drawId, setDrawId] = useState<string | null>(null);

  const drawTypeCollection: { value: DrawType; label: string }[] = [
    { value: 'Polygon', label: 'Polygon' },
    { value: 'Move', label: 'Flytt' },
    { value: 'Point', label: 'Punkt' },
    { value: 'LineString', label: 'Linje' },
    { value: 'Circle', label: 'Sirkel' },
  ];

  const measurementUnitCollection: { value: DistanceUnit; label: string }[] = [
    { value: 'm', label: `${t('shared.units.meter')} [m]` },
    { value: 'NM', label: `${t('shared.units.nauticalMile')} [NM]` },
  ];

  //Look into jotai-effect to have it be reactive globally
  useEffect(() => {
    if (showMeasurements) {
      refreshMeasurements();
    }
  }, [measurementUnit, showMeasurements, refreshMeasurements]);

  useEffect(() => {
    const keyListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        abortDrawing();
      }
    };
    document.addEventListener('keydown', keyListener);
    return () => {
      document.removeEventListener('keydown', keyListener);
    };
  }, [abortDrawing]);

  return (
    <VStack alignItems={'flex-start'} width={'100%'}>
      <Button onClick={() => setDrawEnabled(!drawEnabled)}>
        {drawEnabled ? t('draw.end') : t('draw.begin')}
      </Button>
      {drawEnabled && (
        <>
          <SelectRoot
            collection={createListCollection({
              items: drawTypeCollection,
            })}
            defaultValue={[drawTypeCollection[0].value]}
          >
            <SelectLabel>{t('draw.tools')}:</SelectLabel>
            <SelectTrigger>
              <SelectValueText
                placeholder={t('draw.controls.toolSelect.placeholder')}
              />
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
          <ColorPicker
            value={parseColor(drawStrokeColor)}
            defaultValue={parseColor(drawStrokeColor)}
            onValueChange={(value) => {
              setDrawStrokeColor(value.valueAsString);
            }}
          >
            <ColorPickerLabel>
              {t('draw.controls.colorStroke')}
            </ColorPickerLabel>
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
      <Input
        value={drawId ?? ''}
        onChange={(e) => {
          setDrawId(e.target.value);
        }}
      ></Input>
      <Button
        onClick={() => {
          if (!drawId) return;
          getFeatures(drawId).then((fetchedFeatures) => {
            console.log('fetched:', fetchedFeatures);
            setDrawLayerFeatures(fetchedFeatures, 'EPSG:4326');
          });
        }}
      >
        Hent tegning fra API
      </Button>
      <ButtonGroup>
        <PopoverRoot
          open={clearPopoverOpen}
          onOpenChange={(e) => setClearPopoverOpen(e.open)}
        >
          <PopoverTrigger asChild>
            <Button colorPalette={'red'}>{t('draw.clear')}</Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody>
              <PopoverTitle fontWeight="bold">
                {t('draw.confrimClear')}
              </PopoverTitle>

              <Button
                onClick={() => {
                  setClearPopoverOpen(false);
                  clearDrawing();
                }}
                colorPalette={'red'}
              >
                {t('shared.yes')}
              </Button>
            </PopoverBody>
          </PopoverContent>
        </PopoverRoot>
        <Button
          onClick={() => {
            const drawnFeatures = getDrawnFeatures();
            const mapProjection = getMapProjectionCode();

            if (drawnFeatures == null) {
              return;
            }
            const geojsonFormat = new GeoJSON();
            const geojson = geojsonFormat.writeFeaturesObject(drawnFeatures, {
              featureProjection: mapProjection,
              dataProjection: 'EPSG:4326',
            });

            console.log(geojson);

            saveFeatures(geojson, mapProjection).then((id) => {
              if (id != null) {
                setUrlParameter('drawing', id);
              }
            });
          }}
        >
          {t('draw.save')}
        </Button>
      </ButtonGroup>
      <HStack width={'100%'} justifyContent={'space-between'} h={'40px'}>
        <SwitchRoot
          checked={showMeasurements}
          onCheckedChange={(e) => {
            setShowMeasurements(e.checked);
          }}
          w={'50%'}
        >
          <SwitchHiddenInput />
          <SwitchControl />
          <SwitchLabel>{t('draw.controls.showMeasurements')}</SwitchLabel>
        </SwitchRoot>
        {showMeasurements && (
          <SelectRoot
            value={[measurementUnit]}
            collection={createListCollection({
              items: measurementUnitCollection,
            })}
            defaultValue={[measurementUnitCollection[0].value]}
          >
            <SelectTrigger>
              <SelectValueText />
            </SelectTrigger>
            <SelectContent>
              {measurementUnitCollection.map((item) => (
                <SelectItem
                  key={item.value}
                  item={item.value}
                  onClick={() => {
                    setMeasurementUnit(item.value);
                  }}
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        )}
      </HStack>
    </VStack>
  );
};
