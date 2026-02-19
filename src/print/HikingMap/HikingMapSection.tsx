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
import { usePostHog } from '@posthog/react';
import { getDefaultStore, useSetAtom } from 'jotai';
import { Overlay } from 'ol';
import { getPointResolution, transform } from 'ol/proj';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createHikingMap } from '../../api/hikingMap/hikingMapApi';
import { getEnv } from '../../env';
import { mapAtom } from '../../map/atoms';
import { useMapSettings } from '../../map/mapHooks';
import { getUrlParameter } from '../../shared/utils/urlUtils';
import { isPrintDialogOpenAtom } from '../atoms';
import { utmInfoFromLonLat } from '../EmergencyPoster/utmStringUtils';
import { getOverlayFootprint } from './utils';

const env = getEnv();

const getRotationFromUtmZone = (zone: number): number => {
  // UTM zone 33 is the central meridian for Norway
  const centralMeridian = (zone - 33) * 5;
  return centralMeridian * (Math.PI / 180); // Convert degrees to radians and negate for map rotation
};

const MapScaleOptions = ['1 : 25 000', '1 : 50 000'] as const;

const xExtent1_25k = 17_800;
const yExtent1_25k = 19_500;

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
  const setIsPrintDialogOpen = useSetAtom(isPrintDialogOpenAtom);
  const hasChangedBackground = useRef(false);
  const [includeCompassInstructions, setIncludeCompassInstructions] =
    useState<boolean>(false);
  const [storedDownloadUrl, setStoredDownloadUrl] = useState<string | null>(
    null,
  );
  const [popupBlocked, setPopupBlocked] = useState(false);
  const ph = usePostHog();

  const { setBackgroundLayer } = useMapSettings();
  useEffect(() => {
    const activeBackground = getUrlParameter('backgroundLayer');
    if (activeBackground != 'toporaster' && !hasChangedBackground.current) {
      setBackgroundLayer('toporaster');
    }
    hasChangedBackground.current = true;
  }, [setBackgroundLayer]);

  useEffect(() => {
    const store = getDefaultStore();
    const map = store.get(mapAtom);

    const overlayGridContainer = document.createElement('div');
    overlayGridContainer.className = 'hiking-map-overlay';
    for (let i = 0; i < 3 * 4; i++) {
      overlayGridContainer.appendChild(document.createElement('div'));
    }

    const overlay = new Overlay({
      element: overlayGridContainer,
      positioning: 'center-center',
      stopEvent: false,
      id: 'hikingMapGridOverlay',
    });

    map.addOverlay(overlay);
    const postRenderHandler = () => {
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

      overlayGridContainer.style.width = `${(xExtent1_25k * (selectedScale === '1 : 25 000' ? 1 : 2)) / centerResolution}px`;
      overlayGridContainer.style.height = `${(yExtent1_25k * (selectedScale === '1 : 25 000' ? 1 : 2)) / centerResolution}px`;

      const latLonCenter = transform(center, projection.getCode(), 'EPSG:4326');
      const utmInfo = utmInfoFromLonLat(latLonCenter[0], latLonCenter[1]);

      const rotation = getRotationFromUtmZone(utmInfo.zone);
      overlayGridContainer.style.transform = `rotate(${
        (rotation - map.getView().getRotation()!) * -1
      }rad)`;
    };
    postRenderHandler(); // Called here as well to ensure right size on add and scale change

    // Set overlay to map viewport center on each render
    map.on('postrender', postRenderHandler);

    return () => {
      map.removeOverlay(overlay);
      map.un('postrender', postRenderHandler);
    };
  }, [selectedScale]);

  const printHikingMap = async () => {
    setPopupBlocked(false);
    setPrintLoading(true);
    ph.capture('print_hiking_started', {
      scale: selectedScale,
      includeLegend,
      includeSweeden,
      includeCompassInstructions,
    });

    const store = getDefaultStore();
    const map = store.get(mapAtom);
    const hikinhMapOverlay = map.getOverlayById('hikingMapGridOverlay');
    if (!hikinhMapOverlay) {
      setPrintLoading(false);
      return;
    }

    const overlayElement = hikinhMapOverlay.getElement();
    if (!overlayElement) {
      setPrintLoading(false);
      return;
    }
    const overlayFootprint = getOverlayFootprint(map, overlayElement);

    try {
      const extent = overlayFootprint.extent;
      setStoredDownloadUrl(null);

      const res = await createHikingMap(
        includeLegend,
        includeSweeden,
        includeCompassInstructions,
        [extent[0], extent[2], extent[3], extent[1]],
        [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2],
        selectedScale === '1 : 25 000' ? '25000' : '50000',
        encodeURIComponent(mapName),
      );
      const downloadLink = env.apiUrl + '/nkprint/' + res.linkPdf;
      const openRes = window.open(downloadLink, '_blank');
      if (openRes == null) {
        ph.capture('print_hiking_complete_popup_blocked', {
          scale: selectedScale,
          includeLegend,
          includeSweeden,
          includeCompassInstructions,
        });
        setPopupBlocked(true);
        setStoredDownloadUrl(downloadLink);
      } else {
        ph.capture('print_hiking_complete', {
          scale: selectedScale,
          includeLegend,
          includeSweeden,
          includeCompassInstructions,
        });
      }
    } catch (error) {
      console.error('Error generating hiking map:', error);
      setGenerateButtonText(t('printdialog.hikingMap.errors.generateFailed'));
      setStoredDownloadUrl(null);
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
      <Heading size={'sm'}>
        {t('printdialog.hikingMap.overlayinstructions')}
      </Heading>
      <ButtonGroup w={'100%'} justifyContent={'space-between'}>
        <Button onClick={() => printHikingMap()} disabled={printLoading}>
          {printLoading ? <Spinner /> : generateButtonText}
        </Button>
        {storedDownloadUrl != null && (
          <Button
            onClick={() => {
              setPopupBlocked(false);
              window.open(storedDownloadUrl, '_blank');
              ph.capture('print_hiking_download_link_clicked', {
                scale: selectedScale,
                includeLegend,
                includeSweeden,
                includeCompassInstructions,
              });
            }}
          >
            {t('printdialog.hikingMap.buttons.download')}
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => {
            setIsPrintDialogOpen(false);
          }}
          disabled={printLoading}
        >
          {t('printdialog.hikingMap.buttons.cancel')}
        </Button>
      </ButtonGroup>
      {popupBlocked && (
        <Alert
          status="error"
          title={t('printdialog.hikingMap.popupblockedalert.title')}
          mb={3}
        >
          {t('printdialog.hikingMap.popupblockedalert.body')}
        </Alert>
      )}
    </Stack>
  );
};
