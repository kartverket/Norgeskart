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
import { useAtom, useAtomValue } from 'jotai';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../map/atoms';
import { activeBackgroundLayerAtom } from '../../map/layers/atoms';
import { printFormatAtom, printOrientationAtom } from '../atoms';
import { ExtentOverlay } from './ExtentOverlay';
import { generateMapPdf } from './generateMapPdf';
import { getPrintDimensions, PrintLayout } from './getPrintDimensions';

export const ExtentSection = () => {
  const map = useAtomValue(mapAtom);
  const { t } = useTranslation();
  const [format, setFormat] = useAtom(printFormatAtom);
  const [orientation, setOrientation] = useAtom(printOrientationAtom);
  const formatOptions = [
    { value: 'A4', label: 'A4' },
    { value: 'A3', label: 'A3' },
  ];

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const layout =
    `${format} ${orientation === 'portrait' ? 'Portrait' : 'Landscape'}` as PrintLayout;

  const { overlayWidthPx, overlayHeightPx } = getPrintDimensions(layout);
  const backgroundLayer = useAtomValue(activeBackgroundLayerAtom);

  const handlePrint = async () => {
    await generateMapPdf({
      map,
      overlayRef,
      setLoading,
      t: (key) => key,
      currentLayout: layout,
      backgroundLayer,
    });
  };

  return (
    <>
      <ExtentOverlay
        map={map}
        overlayWidth={overlayWidthPx}
        overlayHeight={overlayHeightPx}
        overlayRef={overlayRef}
      />
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
        <Button variant="outline">{t('shared.cancel')}</Button>
      </HStack>
    </>
  );
};
