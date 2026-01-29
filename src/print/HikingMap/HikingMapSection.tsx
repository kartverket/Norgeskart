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
  Spinner,
  Stack,
  VStack,
} from '@kvib/react';
import { getDefaultStore } from 'jotai';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { Translate } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createHikingMap } from '../../api/hikingMap/hikingMapApi';
import { mapAtom } from '../../map/atoms';

const MapScaleOptions = ['1 : 25 000', '1 : 50 000'] as const;

const xExtent1_25k = 18_000; // TODO: fix these
const yExtent1_25k = 18_000;
const getOverlayFeature = (): Feature | null => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const overlayLayer = map
    .getLayers()
    .getArray()
    .find(
      (layer) => layer.get('id') === 'hikingMapOverlayLayer',
    ) as unknown as VectorLayer;

  console.log(overlayLayer);
  const features = overlayLayer.getSource()?.getFeatures();
  console.log(features);
  return features ? features[0] : null;
};

type HikingMapSacles = (typeof MapScaleOptions)[number];
export const HikingMapSection = () => {
  const [selectedScale, setSelectedScale] =
    useState<HikingMapSacles>('1 : 50 000');
  const [mapName, setMapName] = useState<string>('');
  const [includeLegend, setIncludeLegend] = useState<boolean>(false);
  const [includeSweeden, setIncludeSweeden] = useState<boolean>(false);
  const [printLoading, setPrintLoading] = useState<boolean>(false);
  const [includeCompassInstructions, setIncludeCompassInstructions] =
    useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    const overlayLayer = new VectorLayer({
      source: new VectorSource(),
      properties: { id: 'hikingMapOverlayLayer' },
    });

    const xExtent =
      selectedScale === '1 : 25 000' ? xExtent1_25k : xExtent1_25k * 2;
    const yExtent =
      selectedScale === '1 : 25 000' ? yExtent1_25k : yExtent1_25k * 2;

    const store = getDefaultStore();
    const map = store.get(mapAtom);
    const view = map.getView();

    const maxX = view.getCenter()?.[0]! + xExtent / 2;
    const minX = view.getCenter()?.[0]! - xExtent / 2;
    const maxY = view.getCenter()?.[1]! + yExtent / 2;
    const minY = view.getCenter()?.[1]! - yExtent / 2;

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
    overlayFeature.setStyle(
      new Style({
        stroke: new Stroke({ color: 'white', width: 2 }),
        fill: new Fill({ color: 'rgba(253, 143, 0, 0.5)' }),
      }),
    );

    overlayLayer.getSource()?.addFeature(overlayFeature); //create rectangle overlay on map
    map.addLayer(overlayLayer);

    const translateInteraction = new Translate({
      features: overlayLayer.getSource()?.getFeaturesCollection()!,
    });
    map.addInteraction(translateInteraction);

    return () => {
      overlayLayer.getSource()?.clear();
      map.removeLayer(overlayLayer);
      map.removeInteraction(translateInteraction);
    };
  }, [selectedScale]);

  const printHikingMap = async () => {
    console.log('hi there');
    setPrintLoading(true);
    const overlayFeature = getOverlayFeature();
    console.log(overlayFeature);
    if (!overlayFeature) {
      setPrintLoading(false);
      return;
    }
    const geometry = overlayFeature.getGeometry() as Polygon;
    const extent = geometry.getExtent();
    const res = await createHikingMap(
      includeLegend,
      includeSweeden,
      includeCompassInstructions,
      [extent[0], extent[2], extent[3], extent[1]],
      [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2],
      selectedScale === '1 : 25 000' ? '25000' : '50000',
      mapName,
    );

    console.log(res);
    //sleep for 2 seconds to simulate loading

    setPrintLoading(false);
  };

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
        <Button onClick={() => printHikingMap()} disabled={printLoading}>
          {printLoading ? (
            <Spinner />
          ) : (
            t('printdialog.hikingMap.buttons.generate')
          )}
        </Button>
        <Button variant="secondary">
          {t('printdialog.hikingMap.buttons.cancel')}
        </Button>
      </ButtonGroup>
    </Stack>
  );
};
