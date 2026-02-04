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

const getOrientationOptions = (layouts: PrintLayout[]) => {
  return Array.from(
    new Set(
      layouts.map((l) =>
        l.name.toLowerCase().includes('portrait') ? 'portrait' : 'landscape',
      ),
    ),
  );
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

  const [format, setFormat] = useState('');
  const [orientation, setOrientation] = useState('');
  const [loading, setLoading] = useState(false);

  const formatOptions = getFormatOptions(layouts);
  const orientationOptions = getOrientationOptions(layouts);
  const selectedLayout = getSelectedLayout(layouts, format, orientation);

  useEffect(() => {
    if (layouts.length) {
      setFormat(formatOptions[0]?.value || '');
      setOrientation(orientationOptions[0] || '');
    }
  }, [layouts]);

  useEffect(() => {
    if (!map) return;
    const center = map.getView().getCenter();
    if (center) setPrintBoxCenter(center as [number, number]);
  }, [map, setPrintBoxCenter]);

  useEffect(() => {
    if (!selectedLayout) return;
    const widthPx = selectedLayout?.width;
    const heightPx = selectedLayout?.height;
    if (widthPx && heightPx) {
      setPrintBoxLayout({ widthPx, heightPx });
    }
  }, [selectedLayout, setPrintBoxLayout]);

  const handlePrint = async () => {
    if (!selectedLayout || !printBoxExtent) return;
    await generateMapPdf({
      map,
      setLoading,
      t,
      layout: selectedLayout,
      backgroundLayer,
      extent: printBoxExtent,
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
