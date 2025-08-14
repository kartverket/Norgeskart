import {
  Button,
  ButtonGroup,
  createListCollection,
  Input,
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
import { GeoJSON } from 'ol/format';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFeatures, saveFeatures } from '../api/nkApiClient.ts';
import { DrawType, useDrawSettings } from '../draw/drawHooks.ts';
import { useMapSettings } from '../map/mapHooks.ts';
import { setUrlParameter } from '../shared/utils/urlUtils.ts';
import { ColorControls } from './ColorControls.tsx';
import { MeasurementControls } from './MeasurementControls.tsx';
export const DrawControls = () => {
  const {
    drawEnabled,
    setDrawEnabled,
    setDrawType,
    clearDrawing,
    abortDrawing,
    setDrawLayerFeatures,
    getDrawnFeatures,
  } = useDrawSettings();

  const { getMapProjectionCode } = useMapSettings();
  const { t } = useTranslation();

  const [clearPopoverOpen, setClearPopoverOpen] = useState(false);
  const [drawId, setDrawId] = useState<string | null>(null);

  const drawTypeCollection: { value: DrawType; label: string }[] = [
    { value: 'Polygon', label: 'Polygon' },
    { value: 'Move', label: 'Flytt' },
    { value: 'Point', label: 'Punkt' },
    { value: 'LineString', label: 'Linje' },
    { value: 'Circle', label: 'Sirkel' },
  ];

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
          <ColorControls />
          <MeasurementControls />
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
    </VStack>
  );
};
