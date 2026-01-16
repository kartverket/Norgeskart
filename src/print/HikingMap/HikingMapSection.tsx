import {
  Button,
  ButtonGroup,
  Checkbox,
  FieldLabel,
  FieldRoot,
  Heading,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Separator,
  Stack,
  VStack,
} from '@kvib/react';
import { getDefaultStore } from 'jotai';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { Select, Translate } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../map/atoms';

const MapScaleOptions = ['1 : 25 000', '1 : 50 000'] as const;

const x_extent = 500;
const y_extent = 640;

type HikingMapSacles = (typeof MapScaleOptions)[number];
export const HikingMapSection = () => {
  const [selectedScale, setSelectedScale] =
    useState<HikingMapSacles>('1 : 50 000');
  const [mapName, setMapName] = useState<string>('');
  const [includeLegend, setIncludeLegend] = useState<boolean>(false);
  const [includeSweeden, setIncludeSweeden] = useState<boolean>(false);
  const [includeCompassInstructions, setIncludeCompassInstructions] =
    useState<boolean>(false);
  const { t } = useTranslation();

  const listener = useCallback((e: any) => {
    const store = getDefaultStore();
    const map = store.get(mapAtom);
    const layer = map
      .getLayers()
      .getArray()
      .filter((layer: any) => {
        return layer.get('id') === 'hikingMapOverlayLayer';
      })[0] as VectorLayer;
    const features = layer.getSource()?.getFeatures() as Feature[];
    //
    const feature = features[0];

    feature.setGeometry(
      new Polygon([
        [
          [
            e.target.getCenter()[0] - x_extent / 2,
            e.target.getCenter()[1] - y_extent / 2,
          ],
          [
            e.target.getCenter()[0] - x_extent / 2,
            e.target.getCenter()[1] + y_extent / 2,
          ],
          [
            e.target.getCenter()[0] + x_extent / 2,
            e.target.getCenter()[1] + y_extent / 2,
          ],
          [
            e.target.getCenter()[0] + x_extent / 2,
            e.target.getCenter()[1] - y_extent / 2,
          ],
          [
            e.target.getCenter()[0] - x_extent / 2,
            e.target.getCenter()[1] - y_extent / 2,
          ],
        ],
      ]),
    );
  }, []);

  useEffect(() => {
    const overlayLayer = new VectorLayer({
      source: new VectorSource(),
      properties: { id: 'hikingMapOverlayLayer' },
    });

    const store = getDefaultStore();
    const map = store.get(mapAtom);
    const view = map.getView();

    const maxX = view.getCenter()?.[0]! + x_extent / 2;
    const minX = view.getCenter()?.[0]! - x_extent / 2;
    const maxY = view.getCenter()?.[1]! + y_extent / 2;
    const minY = view.getCenter()?.[1]! - y_extent / 2;

    //create rectangle overlay on map
    map.addLayer(overlayLayer);
    const overlayFeature = new Feature({
      geometry: new Polygon([
        [
          [minX, minY],
          [minX, maxY],
          [maxX, maxY],
          [maxX, minY],
          [minX, minY],
        ],
      ]),
    });
    view.addEventListener('change', listener);
    overlayLayer.getSource()?.addFeature(overlayFeature);
    const selectInteraction = new Select({
      layers: [overlayLayer],
    });
    const translateInteraction = new Translate({
      features: selectInteraction.getFeatures(),
    });
    map.addInteraction(selectInteraction);
    map.addInteraction(translateInteraction);

    return () => {
      view.removeEventListener('change', listener);
      overlayLayer.getSource()?.clear();
      map.removeLayer(overlayLayer);
    };
  }, []);

  return (
    <Stack>
      <Heading size={'md'}>{t('printdialog.hikingMap.heading')}</Heading>
      <FieldRoot
        w={'100%'}
        display={'flex'}
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'top'}
      >
        <FieldLabel>{t('printdialog.hikingMap.fields.scale.label')}</FieldLabel>
        <RadioGroup
          defaultValue="1"
          value={selectedScale}
          onValueChange={(e) => setSelectedScale(e.value as HikingMapSacles)}
        >
          <VStack gap="6">
            {MapScaleOptions.map((scaleOption) => (
              <Radio key={scaleOption} value={scaleOption}>
                {scaleOption}
              </Radio>
            ))}
          </VStack>
        </RadioGroup>
      </FieldRoot>
      <FieldRoot
        w={'100%'}
        display={'flex'}
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <FieldLabel>
          {t('printdialog.hikingMap.fields.mapName.label')}
        </FieldLabel>
        <Input
          placeholder={t('printdialog.hikingMap.fields.mapName.placeholder')}
          type="text"
          value={mapName}
          onChange={(e) => setMapName(e.target.value)}
        />
      </FieldRoot>
      <Separator />
      <HStack w={'100%'} justifyContent={'space-between'} gap={4}>
        <Heading size={'sm'}>Ta med</Heading>
        <VStack>
          <FieldRoot
            w={'100%'}
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Checkbox
              checked={includeLegend}
              onCheckedChange={(e) => setIncludeLegend(e.checked == true)}
            />
            <FieldLabel>
              {t('printdialog.hikingMap.fields.includeLegend.label')}
            </FieldLabel>
          </FieldRoot>
          <FieldRoot
            w={'100%'}
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Checkbox
              checked={includeSweeden}
              onCheckedChange={(e) => setIncludeSweeden(e.checked == true)}
            />
            <FieldLabel>
              {t('printdialog.hikingMap.fields.includeSweeden.label')}
            </FieldLabel>
          </FieldRoot>
          <FieldRoot
            w={'100%'}
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Checkbox
              checked={includeCompassInstructions}
              onCheckedChange={(e) =>
                setIncludeCompassInstructions(e.checked == true)
              }
            />
            <FieldLabel>
              {t(
                'printdialog.hikingMap.fields.includeCompassInstructions.label',
              )}
            </FieldLabel>
          </FieldRoot>
        </VStack>
      </HStack>
      <Separator />
      <Heading size={'sm'}>
        {t('printdialog.hikingMap.overlayinstructions')}
      </Heading>
      <ButtonGroup w={'100%'} justifyContent={'space-between'}>
        <Button>{t('printdialog.hikingMap.buttons.generate')}</Button>
        <Button variant="secondary">
          {t('printdialog.hikingMap.buttons.cancel')}
        </Button>
      </ButtonGroup>
    </Stack>
  );
};
