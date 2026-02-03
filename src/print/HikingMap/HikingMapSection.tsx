import {
  Alert,
  Button,
  ButtonGroup,
  Checkbox,
  FieldHelperText,
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
import { Feature, Overlay } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { Polygon } from 'ol/geom';
import { Translate } from 'ol/interaction';
import { TranslateEvent } from 'ol/interaction/Translate';
import VectorLayer from 'ol/layer/Vector';
import { getPointResolution, transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createHikingMap } from '../../api/hikingMap/hikingMapApi';
import { getEnv } from '../../env';
import { mapAtom } from '../../map/atoms';
import { useMapSettings } from '../../map/mapHooks';
import { getUrlParameter } from '../../shared/utils/urlUtils';
import { utmInfoFromLonLat } from '../EmergencyPoster/utmStringUtils';
import { createMultiPolygonGridFromExtent } from './utils';

const env = getEnv();

const getRotationFromUtmZone = (zone: number): number => {
  // UTM zone 33 is the central meridian for Norway
  const centralMeridian = (zone - 33) * 5;
  return centralMeridian * (Math.PI / 180); // Convert degrees to radians and negate for map rotation
};

const MapScaleOptions = ['1 : 25 000', '1 : 50 000'] as const;

const xExtent1_25k = 17_800;
const yExtent1_25k = 19_500;
const getOverlayFeature = (): Feature | null => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const overlayLayer = map
    .getLayers()
    .getArray()
    .find(
      (layer) => layer.get('id') === 'hikingMapOverlayLayer',
    ) as unknown as VectorLayer;

  const features = overlayLayer.getSource()?.getFeatures();
  return features ? features[0] : null;
};

const generateOverlayFeture = (center: Coordinate, scale: HikingMapSacles) => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const view = map.getView();
  const xExtent = scale === '1 : 25 000' ? xExtent1_25k : xExtent1_25k * 2;
  const yExtent = scale === '1 : 25 000' ? yExtent1_25k : yExtent1_25k * 2;

  const maxX = center[0]! + xExtent / 2;
  const minX = center[0]! - xExtent / 2;
  const maxY = center[1]! + yExtent / 2;
  const minY = center[1]! - yExtent / 2;
  const overlayFeature = new Feature({});

  const geometry = createMultiPolygonGridFromExtent(
    [minX, minY],
    [maxX, maxY],
    3,
    4,
  );
  overlayFeature.setStyle(
    new Style({
      stroke: new Stroke({ color: 'white', width: 2 }),
      fill: new Fill({ color: 'rgba(253, 143, 0, 0.5)' }),
    }),
  );
  const projectionCode = view.getProjection().getCode();
  const [lon, lat] = transform(center, projectionCode, 'EPSG:4326');
  const utmInfo = utmInfoFromLonLat(lon, lat);

  const rotation = getRotationFromUtmZone(utmInfo.zone);
  geometry.rotate(rotation - view.getRotation()!, center);
  overlayFeature.setGeometry(geometry);
  return overlayFeature;
};

type HikingMapSacles = (typeof MapScaleOptions)[number];
export const HikingMapSection = () => {
  const [selectedScale, setSelectedScale] =
    useState<HikingMapSacles>('1 : 50 000');
  const [mapName, setMapName] = useState<string>('');
  const { t } = useTranslation();
  const [generateButtonText, setGenerateButtonText] = useState<string>(
    t('printdialog.hikingMap.buttons.generate'),
  );
  const [includeLegend, setIncludeLegend] = useState<boolean>(false);
  const [includeSweeden, setIncludeSweeden] = useState<boolean>(false);
  const [printLoading, setPrintLoading] = useState<boolean>(false);
  const previousZone = useRef<number | null>(null);
  const hasChangedBackground = useRef(false);
  const [includeCompassInstructions, setIncludeCompassInstructions] =
    useState<boolean>(false);
  const [storedDownloadUrl, setStoredDownloadUrl] = useState<string | null>(
    null,
  );

  const { setBackgroundLayer } = useMapSettings();
  useEffect(() => {
    const activeBackground = getUrlParameter('backgroundLayer');
    if (activeBackground != 'toporaster' && !hasChangedBackground.current) {
      setBackgroundLayer('toporaster');
    }
    hasChangedBackground.current = true;
  }, [setBackgroundLayer]);

  useEffect(() => {
    const overlayLayer = new VectorLayer({
      source: new VectorSource(),
      zIndex: 1000,
      properties: { id: 'hikingMapOverlayLayer' },
    });

    const store = getDefaultStore();
    const map = store.get(mapAtom);
    const view = map.getView();
    const overlayFeature = generateOverlayFeture(
      view.getCenter()!,
      selectedScale,
    );

    overlayLayer.getSource()?.addFeature(overlayFeature); //create rectangle overlay on map
    map.addLayer(overlayLayer);

    const source = overlayLayer.getSource();
    const featuresForTranslation = source?.getFeaturesCollection();

    const translateInteraction = new Translate({
      features: featuresForTranslation || undefined,
    });

    const centerMarker = document.createElement('div');
    centerMarker.className = 'hiking-map-overlay';
    for (let i = 0; i < 3 * 4; i++) {
      centerMarker.appendChild(document.createElement('div'));
    }

    // Create the overlay and position it using viewport coordinates
    const overlay = new Overlay({
      element: centerMarker,
      positioning: 'center-center',
      stopEvent: false,
      id: 'hikingMapCenterOverlay',
    });

    // Add to map
    map.addOverlay(overlay);

    // Set overlay to map viewport center on each render
    map.on('postrender', () => {
      const size = map.getSize();
      if (!size) {
        return;
      }
      const center = map.getCoordinateFromPixel([size[0] / 2, size[1] / 2]);
      overlay.setPosition(center);

      const projection = map.getView().getProjection();
      if (!projection) {
        return;
      }

      const resolution = map.getView().getResolution();
      if (!resolution) {
        return;
      }

      const centerResolution = getPointResolution(
        projection,
        resolution,
        center,
      );

      centerMarker.style.width = `${(xExtent1_25k * (selectedScale === '1 : 25 000' ? 1 : 2)) / centerResolution}px`;
      centerMarker.style.height = `${(yExtent1_25k * (selectedScale === '1 : 25 000' ? 1 : 2)) / centerResolution}px`;

      const latLonCenter = transform(center, projection.getCode(), 'EPSG:4326');
      const utmInfo = utmInfoFromLonLat(latLonCenter[0], latLonCenter[1]);

      const rotation = getRotationFromUtmZone(utmInfo.zone);
      centerMarker.style.transform = `rotate(${
        (rotation - map.getView().getRotation()!) * -1
      }rad)`;
    });

    translateInteraction.on('translateend', (e) => {
      if (e instanceof TranslateEvent) {
        const feature = e.features.getArray()[0];
        const geometry = feature.getGeometry() as Polygon;
        const extent = geometry.getExtent();
        const center = [
          (extent[0] + extent[2]) / 2,
          (extent[1] + extent[3]) / 2,
        ];
        const view = map.getView();
        const projectionCode = view.getProjection().getCode();
        const [lon, lat] = transform(center, projectionCode, 'EPSG:4326');
        const utmInfo = utmInfoFromLonLat(lon, lat);
        if (previousZone.current && previousZone.current !== utmInfo.zone) {
          overlayLayer.getSource()?.clear();
          const newOverlayFeature = generateOverlayFeture(
            center,
            selectedScale,
          );
          overlayLayer.getSource()?.addFeature(newOverlayFeature);
        }
        previousZone.current = utmInfo.zone;
      }
    });
    map.addInteraction(translateInteraction);

    return () => {
      overlayLayer
        .getSource()
        ?.getFeatures()
        .forEach((f) => {
          overlayLayer.getSource()?.removeFeature(f);
        });
      map.removeLayer(overlayLayer);
      map.removeInteraction(translateInteraction);
      map.removeOverlay(overlay);
    };
  }, [selectedScale]);

  const printHikingMap = async () => {
    setPrintLoading(true);
    const overlayFeature = getOverlayFeature();

    if (!overlayFeature) {
      setPrintLoading(false);
      return;
    }
    try {
      const geometry = overlayFeature.getGeometry() as Polygon;
      const extent = geometry.getExtent();
      let downloadLink = '';
      if (storedDownloadUrl) {
        downloadLink = storedDownloadUrl;
      } else {
        const res = await createHikingMap(
          includeLegend,
          includeSweeden,
          includeCompassInstructions,
          [extent[0], extent[2], extent[3], extent[1]],
          [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2],
          selectedScale === '1 : 25 000' ? '25000' : '50000',
          encodeURIComponent(mapName),
        );
        downloadLink = env.apiUrl + '/nkprint/' + res.linkPdf;
      }

      if (downloadLink) {
        const openRef = window.open(downloadLink, '_blank');
        if (!openRef) {
          setStoredDownloadUrl(downloadLink);
        } else {
          setStoredDownloadUrl(null);
        }
      }
    } catch (error) {
      console.error('Error generating hiking map:', error);
      setGenerateButtonText(t('printdialog.hikingMap.errors.generateFailed'));
      setTimeout(() => {
        setGenerateButtonText(t('printdialog.hikingMap.buttons.generate'));
      }, 3000);
    }

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
        alignItems={'flex-start'}
      >
        <FieldLabel>
          {t('printdialog.hikingMap.fields.mapName.label')}
        </FieldLabel>
        <Stack>
          <Input
            placeholder={t('printdialog.hikingMap.fields.mapName.placeholder')}
            type="text"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
          />
          <FieldHelperText>
            {t('printdialog.hikingMap.fields.mapName.helpertext')}
          </FieldHelperText>
        </Stack>
      </FieldRoot>
      <Separator />
      <HStack w={'100%'} justifyContent={'space-between'} gap={4}>
        <Heading size={'sm'}>
          {t('printdialog.hikingMap.fields.heading')}
        </Heading>
        <VStack>
          <FieldRoot
            w={'100%'}
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'flex-start'}
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
            justifyContent={'flex-start'}
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
            justifyContent={'flex-start'}
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
      {storedDownloadUrl && (
        <Alert
          size="md"
          status="info"
          title={t('printdialog.hikingMap.popupblockedalert.title')}
          variant="subtle"
        >
          {t('printdialog.hikingMap.popupblockedalert.body')}
        </Alert>
      )}
      <Heading size={'sm'}>
        {t('printdialog.hikingMap.overlayinstructions')}
      </Heading>
      <ButtonGroup w={'100%'} justifyContent={'space-between'}>
        <Button onClick={() => printHikingMap()} disabled={printLoading}>
          {printLoading ? <Spinner /> : generateButtonText}
        </Button>
        <Button variant="secondary">
          {t('printdialog.hikingMap.buttons.cancel')}
        </Button>
      </ButtonGroup>
    </Stack>
  );
};
