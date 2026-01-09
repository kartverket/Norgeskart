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
import { mapAtom } from '../map/atoms';
import { printFormatAtom, printOrientationAtom } from './atoms';
import { useDraggableOverlay } from './hooks/useDraggableOverlay';
import { getDpiMetrics } from './utils/getDpiMetrics';

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
  const layout = `${format} ${orientation === 'portrait' ? 'Portrait' : 'Landscape'}`;

  const { overlayWidth, overlayHeight } = getDpiMetrics(layout);
  // const { generate, loading } = useGenerateMapPdf(layout);

  // Create overlay inside map viewport
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

  // Update overlay size on layout change
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

  // Apply overlay position
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.style.top = `${overlayPosition.y}px`;
      overlayRef.current.style.left = `${overlayPosition.x}px`;
    }
  }, [overlayPosition]);

  // Enable dragging
  useDraggableOverlay({
    map,
    overlayRef,
    overlayWidth,
    overlayHeight,
    setOverlayPosition,
  });

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
        <Button>Hent kartet</Button>
        <Button variant="outline">Avbryt</Button>
      </HStack>
    </>
  );
};
