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
import { mapAtom } from '../../map/atoms';
import { activeBackgroundLayerAtom } from '../../map/layers/atoms';
import { printFormatAtom, printOrientationAtom } from '../atoms';
import { generateMapPdf } from './generateMapPdf';
import { getPrintDimensions, PrintLayout } from './getPrintDimensions';
import { PrintExtentOverlay } from './ExtentOverlay';

export const PrintExtentSection = () => {
  const map = useAtomValue(mapAtom);
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
      <PrintExtentOverlay
        map={map}
        overlayWidth={overlayWidthPx}
        overlayHeight={overlayHeightPx}
        overlayRef={overlayRef}
      />
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
        <SelectLabel>Velg format</SelectLabel>
        <SelectTrigger>
          <SelectValueText />
        </SelectTrigger>
        <SelectContent>
          {formatOptions.map((format) => (
            <SelectItem key={format.value} item={format.value}>
              {format.label}
            </SelectItem>
          ))}
        </SelectContent>
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
            <Radio value="portrait">Stående</Radio>
            <Radio value="landscape">Liggende</Radio>
          </Stack>
        </RadioGroup>
      </Box>
      <Text mt={4}>Plasser det oransje feltet i området du vil skrive ut</Text>
      <HStack mt={4}>
        {loading && <Spinner />}
        <Button onClick={handlePrint}>Hent kartet</Button>
        <Button variant="outline">Avbryt</Button>
      </HStack>
    </>
  );
};
