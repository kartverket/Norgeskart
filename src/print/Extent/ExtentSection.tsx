import {
  Alert,
  Box,
  Button,
  createListCollection,
  HStack,
  Radio,
  RadioGroup,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Separator,
  Spinner,
  Stack,
  Text,
} from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom, scaleAtom } from '../../map/atoms';

import { isVectorTileLayer } from '../../map/layers/backgroundLayers';
import { backgroundLayerAtom } from '../../map/layers/config/backgroundLayers/atoms';
import { isPrintDialogOpenAtom } from '../atoms';
import { PrintBox } from './PrintBox';
import { getExtentFromMap, printBoxLayoutAtom } from './atoms';
import { generateMapPdf } from './generateMapPdf';
import { PrintLayout, usePrintCapabilities } from './usePrintCapabilities';

interface ExtentSectionProps {
  onCancel?: () => void;
}

const getFormatOptions = (layouts: PrintLayout[]) => {
  return Array.from(new Set(layouts.map((l) => (l.name.match(/A\d/) || [])[0])))
    .filter(Boolean)
    .map((f) => ({ value: f, label: f }));
};

const getSelectedLayout = (
  layouts: PrintLayout[],
  format: string,
  orientation: string,
) => {
  return layouts.find(
    (l) =>
      l.name.toLowerCase().includes(format.toLowerCase()) &&
      l.name.toLowerCase().includes(orientation),
  );
};

// Used to scale down the layout size for better fit on screen.
const LAYOUT_SCALE: Record<string, number> = {
  '1_A4_portrait': 0.9,
  '2_A4_landscape': 1.0,
  '3_A3_portrait': 0.8,
  '4_A3_landscape': 0.9,
};

export const ExtentSection = ({ onCancel }: ExtentSectionProps) => {
  const { t } = useTranslation();
  const layouts: PrintLayout[] = usePrintCapabilities();
  const map = useAtomValue(mapAtom);
  const backgroundLayer = useAtomValue(backgroundLayerAtom);
  const setIsPrintDialogOpen = useSetAtom(isPrintDialogOpenAtom);
  const setPrintBoxLayout = useSetAtom(printBoxLayoutAtom);
  const layout = useAtomValue(printBoxLayoutAtom);
  const screenScale = useAtomValue(scaleAtom);
  const ph = usePostHog();

  const [format, setFormat] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [loading, setLoading] = useState(false);

  const formatOptions = getFormatOptions(layouts);
  const selectedLayout = getSelectedLayout(layouts, format, orientation);

  const printScale =
    selectedLayout?.width && selectedLayout.width > 0 && screenScale
      ? Math.round(
          screenScale * (layout.widthPx / selectedLayout.width) * (72 / 96),
        )
      : undefined;

  useEffect(() => {
    if (!selectedLayout) return;

    const layoutScale = LAYOUT_SCALE[selectedLayout.name] || 1;

    setPrintBoxLayout({
      widthPx: Math.round((selectedLayout.width || 0) * layoutScale),
      heightPx: Math.round((selectedLayout.height || 0) * layoutScale),
    });
  }, [selectedLayout, setPrintBoxLayout]);

  const handlePrint = async () => {
    const printBoxExtent = getExtentFromMap(map, layout);
    if (!selectedLayout || !printBoxExtent) return;

    ph.capture('print_extent_initiated', {
      format,
      orientation,
    });
    await generateMapPdf({
      map,
      setLoading,
      t,
      layout: selectedLayout,
      backgroundLayer,
      extent: printBoxExtent,
      onSuccess: () => {
        ph.capture('print_extent_complete', {
          format,
          orientation,
        });
      },
      onError: (msg) => {
        ph.captureException('print_extent_error', {
          errorType: 'print_extent_error',
          format,
          orientation,
          errorMessage: msg,
        });
      },
    });
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100%">
      <PrintBox map={map} />
      {isVectorTileLayer(backgroundLayer) && (
        <Alert status="warning" mb={2}>
          {t('printExtent.vectorTileFallbackWarning')}
        </Alert>
      )}
      {map && map.getView().getProjection().getCode() !== 'EPSG:25833' && (
        <Alert status="warning" mb={2}>
          {t('printExtent.projectionWarning')}
        </Alert>
      )}
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
        <Text fontSize="sm" fontWeight="semibold">
          {t('printExtent.label')}
        </Text>
        <SelectRoot
          collection={createListCollection({ items: formatOptions })}
          value={[format]}
          width="180px"
          onValueChange={(details) => {
            if (details.value.length > 0) {
              setFormat(details.value[0] as 'A4' | 'A3');
            }
          }}
        >
          <HStack gap={4} mt={4}>
            <SelectLabel>{t('printExtent.placeholder')}</SelectLabel>
            <SelectTrigger width="180px">
              <SelectValueText />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map((format) => (
                <SelectItem key={format.value} item={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </HStack>
        </SelectRoot>
        <Separator mt={4} />
        <Box mt={4}>
          <Text fontSize="sm" fontWeight="semibold" mb={2}>
            {t('printExtent.orientationHeading')}
          </Text>
          <RadioGroup
            value={orientation}
            onValueChange={(details) => {
              if (details.value !== null) {
                setOrientation(details.value as 'portrait' | 'landscape');
              }
            }}
          >
            <Stack gap={4}>
              <Radio value="portrait">
                {t('printExtent.orientation.portrait')}
              </Radio>
              <Radio value="landscape">
                {t('printExtent.orientation.landscape')}
              </Radio>
            </Stack>
          </RadioGroup>
        </Box>
        <Separator mt={4} mb={4} />
        {printScale && (
          <Stack alignItems="flex-start" gap={1}>
            <Text fontSize="sm" fontWeight="bold">
              {t('printExtent.scale')}: 1 : {printScale.toLocaleString('no-NO')}
            </Text>
            <Text fontSize="sm">
              {t('printExtent.scaleNote', {
                screenScale: screenScale?.toLocaleString('no-NO'),
              })}
            </Text>
          </Stack>
        )}
      </Box>
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
        <HStack width="100%" justifyContent="space-between">
          <Button
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                setIsPrintDialogOpen(false);
              }
            }}
            variant="outline"
          >
            {t('shared.cancel')}
          </Button>
          <HStack>
            {loading && <Spinner />}
            <Button onClick={handlePrint}>
              {t('printdialog.buttons.createMap')}
            </Button>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
};
