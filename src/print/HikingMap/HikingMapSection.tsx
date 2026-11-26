import {
  Alert,
  Box,
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
import { backgroundLayerAtom } from '../../map/layers/config/backgroundLayers/atoms';
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

interface HikingMapSectionProps {
  onCancel?: () => void;
}

export const HikingMapSection = ({ onCancel }: HikingMapSectionProps) => {
  const [selectedScale, setSelectedScale] =
    useState<HikingMapSacles>('1 : 25 000');
  const [mapName, setMapName] = useState<string>('');
  const { t } = useTranslation();
  const [generateButtonText, setGenerateButtonText] = useState<string>(
    t('printdialog.buttons.createMap'),
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

  const setBackgroundLayer = useSetAtom(backgroundLayerAtom);
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

      if (!center) {
        return;
      }

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
    let overlayFootprint: ReturnType<typeof getOverlayFootprint> | undefined;
    try {
      overlayFootprint = getOverlayFootprint(map, overlayElement);
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
      ph.captureException(error, {
        errorType: 'print_hiking_failed',
        scale: selectedScale,
        includeLegend,
        includeSweeden,
        includeCompassInstructions,
        extent: overlayFootprint?.extent,
        errorMessage: (error as Error).message,
      });
      setStoredDownloadUrl(null);
      setTimeout(() => {
        setGenerateButtonText(t('printdialog.buttons.createMap'));
      }, 3000);
    }

    setPrintLoading(false);
  };

  return (
    <Stack minHeight="100%">
      <Box
        width="100%"
        border="1px solid"
        borderColor="#E0E0E0"
        borderRadius="8px"
        backgroundColor="white"
        boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
        padding={3}
        mb={4}
      >
        <Heading size="sm" fontWeight="semibold">
          {t('printdialog.hikingMap.heading')}
        </Heading>
        <Stack gap={4} mt={4}>
          <FieldRoot display="flex" flexDirection="column" gap={3}>
            <FieldLabel fontSize="sm" fontWeight="semibold">
              {t('printdialog.hikingMap.fields.scale.label')}
            </FieldLabel>
            <RadioGroup
              defaultValue="1"
              value={selectedScale}
              onValueChange={(e) =>
                setSelectedScale(e.value as HikingMapSacles)
              }
            >
              <VStack alignItems="flex-start" gap={2}>
                {MapScaleOptions.map((scaleOption) => (
                  <Radio key={scaleOption} value={scaleOption}>
                    {scaleOption}
                  </Radio>
                ))}
              </VStack>
            </RadioGroup>
          </FieldRoot>
          <Separator />
          <FieldRoot display="flex" flexDirection="column" gap={2}>
            <FieldLabel fontSize="sm" fontWeight="semibold">
              {t('printdialog.hikingMap.fields.mapName.label')}
            </FieldLabel>
            <Stack width="100%" gap={1}>
              <Input
                width="100%"
                placeholder={t(
                  'printdialog.hikingMap.fields.mapName.placeholder',
                )}
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
          <Stack gap={3}>
            <Heading size="sm" fontSize="sm" fontWeight="semibold">
              {t('printdialog.hikingMap.fields.heading')}
            </Heading>
            <VStack alignItems="stretch" gap={3}>
              <FieldRoot
                w="100%"
                display="flex"
                flexDirection="row"
                alignItems="center"
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
                w="100%"
                display="flex"
                flexDirection="row"
                alignItems="center"
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
                w="100%"
                display="flex"
                flexDirection="row"
                alignItems="center"
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
          </Stack>
        </Stack>
      </Box>
      {popupBlocked && (
        <Alert
          status="error"
          title={t('printdialog.hikingMap.popupblockedalert.title')}
          mb={3}
        >
          {t('printdialog.hikingMap.popupblockedalert.body')}
        </Alert>
      )}
      <Box
        position="sticky"
        bottom={0}
        zIndex={1}
        width="100%"
        backgroundColor="white"
        marginTop="auto"
        paddingTop={2}
      >
        <Alert status="info" mb={2} alignItems="center">
          {t('printdialog.overlayInstructions')}
        </Alert>
        <ButtonGroup w={'100%'} justifyContent={'space-between'}>
          <Button
            variant="secondary"
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                setIsPrintDialogOpen(false);
              }
            }}
            disabled={printLoading}
          >
            {t('printdialog.hikingMap.buttons.cancel')}
          </Button>
          <HStack>
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
            <Button onClick={() => printHikingMap()} disabled={printLoading}>
              {printLoading ? <Spinner /> : generateButtonText}
            </Button>
          </HStack>
        </ButtonGroup>
      </Box>
    </Stack>
  );
};
