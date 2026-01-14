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
  Stack,
  Text,
} from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { mapAtom } from '../../map/atoms';
import { activeBackgroundLayerAtom } from '../../map/layers/atoms';
import type { BackgroundLayerName } from '../../map/layers/backgroundLayers';
import { useBackgoundLayers } from '../../map/layers/backgroundLayers';
import { printFormatAtom, printOrientationAtom } from '../atoms';
import { generateMapPdf } from './generateMapPdf';
import { getDpiMetrics } from './getDpiMetrics';
import { useDraggableOverlay } from './useDraggableOverlay';

export const PrintExtentTab = () => {
  const map = useAtomValue(mapAtom);
  const [format, setFormat] = useAtom(printFormatAtom);
  const [orientation, setOrientation] = useAtom(printOrientationAtom);
  const formatOptions = [
    { value: 'A4', label: 'A4' },
    { value: 'A3', label: 'A3' },
  ];

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const layout = `${format} ${orientation === 'portrait' ? 'Portrait' : 'Landscape'}`;

  const { overlayWidth, overlayHeight } = getDpiMetrics(layout);

  // Hent bakgrunnslag og laginfo via hooks
  const backgroundLayer = useAtomValue(
    activeBackgroundLayerAtom,
  ) as BackgroundLayerName;
  const { getBackgroundLayer } = useBackgoundLayers();
  const layerInfo = getBackgroundLayer(backgroundLayer);

  useEffect(() => {
    if (!map) return;

    const mapContainer = map.getViewport();
    const overlay = document.createElement('div');
    overlayRef.current = overlay;

    overlay.style.position = 'absolute';
    overlay.style.border = '2px dashed rgba(0,0,0,0.5)';
    overlay.style.backgroundColor = '#FF770082';
    overlay.style.cursor = 'move';
    overlay.style.zIndex = '999';
    overlay.style.pointerEvents = 'auto';
    overlay.style.userSelect = 'none';
    overlay.style.width = `${overlayWidth}px`;
    overlay.style.height = `${overlayHeight}px`;

    const mapRect = mapContainer.getBoundingClientRect();
    setOverlayPosition({
      x: mapRect.width / 2 - overlayWidth / 2,
      y: mapRect.height / 2 - overlayHeight / 2,
    });

    mapContainer.appendChild(overlay);

    return () => overlay.remove();
  }, [map, overlayWidth, overlayHeight]);

  useEffect(() => {
    if (!overlayRef.current || !map) return;

    overlayRef.current.style.width = `${overlayWidth}px`;
    overlayRef.current.style.height = `${overlayHeight}px`;

    const mapRect = map.getViewport().getBoundingClientRect();
    setOverlayPosition({
      x: mapRect.width / 2 - overlayWidth / 2,
      y: mapRect.height / 2 - overlayHeight / 2,
    });
  }, [layout, overlayWidth, overlayHeight, map]);

  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.style.top = `${overlayPosition.y}px`;
      overlayRef.current.style.left = `${overlayPosition.x}px`;
    }
  }, [overlayPosition]);

  useDraggableOverlay({
    map,
    overlayRef,
    overlayWidth,
    overlayHeight,
    setOverlayPosition,
  });

  const handlePrint = async () => {
    await generateMapPdf({
      map,
      overlayRef,
      setLoading,
      t: (key) => key, // evt. bruk din oversetter
      currentLayout: layout,
      backgroundLayer,
      layerInfo,
    });
  };

  return (
    <>
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
        <Button onClick={handlePrint}>Hent kartet</Button>
        <Button variant="outline">Avbryt</Button>
      </HStack>
    </>
  );
};
