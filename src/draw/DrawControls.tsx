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
  SwitchControl,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
  VStack,
} from '@kvib/react';
import { Feature, FeatureCollection } from 'geojson';
import { Coordinate } from 'ol/coordinate';
import { Geometry, LineString, Point, Polygon } from 'ol/geom';
import { transform } from 'ol/proj';
import { Style } from 'ol/style';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getFeatures,
  getStyleForStorage,
  saveFeatures,
} from '../api/nkApiClient.ts';
import { DrawType, useDrawSettings } from '../draw/drawHooks.ts';
import { getEnvName } from '../env.ts';
import { useMapSettings } from '../map/mapHooks.ts';
import { setUrlParameter } from '../shared/utils/urlUtils.ts';
import { ColorControls } from './ColorControls.tsx';
import { LineWidthControl } from './LineWidthControl.tsx';
import { MeasurementControls } from './MeasurementControls.tsx';

const getGeometryCoordinates = (geo: Geometry, mapProjection: string) => {
  let coordinates: Coordinate[][] | Coordinate[] | Coordinate = [];
  if (geo instanceof Polygon) {
    coordinates = geo
      .getCoordinates()
      .map((c) =>
        c.map((coord) => transform(coord, mapProjection, 'EPSG:4326')),
      );
  } else if (geo instanceof LineString) {
    coordinates = [
      geo
        .getCoordinates()
        .map((coord) => transform(coord, mapProjection, 'EPSG:4326')),
    ];
  } else if (geo instanceof Point) {
    coordinates = transform(geo.getCoordinates(), mapProjection, 'EPSG:4326');
  }

  return coordinates;
};

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
  const envName = getEnvName();

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

  const onSaveFeatures = () => {
    const drawnFeatures = getDrawnFeatures();
    const mapProjection = getMapProjectionCode();

    if (drawnFeatures == null) {
      return;
    }

    const geometryWithStyle = drawnFeatures
      .map((feature) => {
        const geometry = feature.getGeometry();
        if (!geometry) {
          return null;
        }
        const featureCoordinates = getGeometryCoordinates(
          geometry,
          mapProjection,
        );
        const featureStyle = feature.getStyle() as Style | null;
        const styleForStorage = getStyleForStorage(featureStyle);
        return {
          type: 'Feature',
          geometry: {
            type: geometry.getType(),
            coordinates: featureCoordinates,
          },
          properties: {
            style: styleForStorage,
          },
        } as Feature;
      })
      .filter((f) => f !== null);

    const collection = {
      type: 'FeatureCollection',
      features: geometryWithStyle,
    } as FeatureCollection;

    saveFeatures(collection).then((id) => {
      if (id != null) {
        setUrlParameter('drawing', id);
      }
    });
  };

  return (
    <VStack alignItems={'flex-start'} width={'100%'}>
      <SwitchRoot
        checked={drawEnabled}
        onCheckedChange={(e) => {
          setDrawEnabled(e.checked);
        }}
        w={'50%'}
      >
        <SwitchHiddenInput />
        <SwitchControl />
        <SwitchLabel>{t('draw.begin')}</SwitchLabel>
      </SwitchRoot>

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
          <LineWidthControl />
        </>
      )}
      {envName == 'local' && (
        <>
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
                setDrawLayerFeatures(fetchedFeatures, 'EPSG:4326');
              });
            }}
          >
            Hent tegning fra API
          </Button>
        </>
      )}
      <MeasurementControls />
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
        <Button onClick={onSaveFeatures}>{t('draw.save')}</Button>
      </ButtonGroup>
    </VStack>
  );
};
