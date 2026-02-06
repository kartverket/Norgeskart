import {
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
  Spinner,
  Stack,
  Text,
} from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../map/atoms';
import { activeBackgroundLayerAtom } from '../../map/layers/atoms';
import { isPrintDialogOpenAtom } from '../atoms';
import { PrintBox } from './PrintBox';
import {
  printBoxCenterAtom,
  printBoxExtentAtom,
  printBoxExtentEffect,
  printBoxLayoutAtom,
} from './atoms';
import { generateMapPdf } from './generateMapPdf';
import { PrintLayout, usePrintCapabilities } from './usePrintCapabilities';

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
  '3_A3_portrait': 0.65,
  '4_A3_landscape': 0.8,
};

export const ExtentSection = () => {
  const { t } = useTranslation();
  const layouts: PrintLayout[] = usePrintCapabilities();
  const map = useAtomValue(mapAtom);
  const backgroundLayer = useAtomValue(activeBackgroundLayerAtom);
  const setIsPrintDialogOpen = useSetAtom(isPrintDialogOpenAtom);
  const setPrintBoxCenter = useSetAtom(printBoxCenterAtom);
  const setPrintBoxLayout = useSetAtom(printBoxLayoutAtom);
  const printBoxExtent = useAtomValue(printBoxExtentAtom);
  useAtom(printBoxExtentEffect);
  const ph = usePostHog();

  const [format, setFormat] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [loading, setLoading] = useState(false);

  const formatOptions = getFormatOptions(layouts);
  const selectedLayout = getSelectedLayout(layouts, format, orientation);

  useEffect(() => {
    if (!map) return;
    const center = map.getView().getCenter();
    if (center) setPrintBoxCenter(center as [number, number]);
  }, [map, setPrintBoxCenter]);

  useEffect(() => {
    if (!selectedLayout) return;

    const layoutScale = LAYOUT_SCALE[selectedLayout.name] || 1;

    setPrintBoxLayout({
      widthPx: Math.round((selectedLayout.width || 0) * layoutScale),
      heightPx: Math.round((selectedLayout.height || 0) * layoutScale),
    });
  }, [selectedLayout, setPrintBoxLayout]);

  const handlePrint = async () => {
    if (!selectedLayout || !printBoxExtent) return;

    ph.capture('print_extent', {
      status: 'started',
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
        ph.capture('print_extent', {
          status: 'success',
          format,
          orientation,
        });
      },
      onError: (msg) => {
        ph.capture('print_extent', {
          status: 'error',
          format,
          orientation,
          errorMessage: msg,
        });
      },
    });
  };

  return (
    <>
      <PrintBox map={map} />
      <Text>{t('printExtent.label')}</Text>
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
      <Box mt={4} mb={6}>
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
      <Text mt={4}>{t('printExtent.description')}</Text>
      <HStack mt={4}>
        {loading && <Spinner />}
        <Button onClick={handlePrint}>{t('printExtent.button.print')}</Button>
        <Button
          onClick={() => {
            setIsPrintDialogOpen(false);
          }}
          variant="outline"
        >
          {t('shared.cancel')}
        </Button>
      </HStack>
    </>
  );
};
