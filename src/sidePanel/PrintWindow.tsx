import {
  Flex,
  Text,
  Spinner,
  Button,
  SelectRoot,
  SelectLabel,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
  createListCollection,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../map/atoms';
import { getDpiMetrics, PrintLayout } from '../shared/utils/getDpiMetrics';
import { printMap } from '../shared/utils/printMap';
import { useDraggableOverlay } from '../shared/utils/useDraggableOverlay';
import { useGenerateMapPdf } from '../shared/utils/useGenerateMapPdf';

interface PrintWindowProps {
  onClose: () => void;
}

export default function PrintWindow({ onClose }: PrintWindowProps) {
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
  const [layout, setLayout] = useState<PrintLayout>('A4 Portrait');

  const { aWidthPx, aHeightPx, overlayWidth, overlayHeight } = getDpiMetrics(layout);
  const { generate, loading } = useGenerateMapPdf(layout);

  const LAYOUTS: PrintLayout[] = ['A4 Portrait', 'A4 Landscape', 'A3 Portrait', 'A3 Landscape'];

  const layoutCollection = createListCollection({
    items: LAYOUTS.map((l) => ({ key: l, label: l, value: l })),
  });

  // Create draggable overlay on the map
  useEffect(() => {
    if (!map) return;
    const mapContainer = map.getViewport();
    const overlay = document.createElement('div');
    overlayRef.current = overlay;

    overlay.style.position = 'absolute';
    overlay.style.border = '2px dashed rgba(0,0,0,0.5)';
    overlay.style.backgroundColor = 'rgba(255,255,255,0.1)';
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

  // Resize overlay when layout changes
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

  // Update overlay position in DOM
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.style.top = `${overlayPosition.y}px`;
      overlayRef.current.style.left = `${overlayPosition.x}px`;
    }
  }, [overlayPosition]);

  // Enable dragging
  useDraggableOverlay({ map, overlayRef, overlayWidth, overlayHeight, setOverlayPosition });

  const handleQuickPrint = () => {
    if (!map || !overlayRef.current) return;
    printMap({
      map,
      overlayRef,
      a4WidthPx: aWidthPx,
      a4HeightPx: aHeightPx,
      projection: map.getView().getProjection().getCode(),
      setLoading: () => {},
    });
  };

  return (
    <Flex direction="column" gap={3} p={3}>
      {/* Only content, no title or close button */}
      <Text fontSize="sm">{t('printMap.description')}</Text>

      {/* Layout selector */}
      <SelectRoot collection={layoutCollection} value={[layout]}>
        <SelectLabel>{t('printMap.selectPrintLayout')}</SelectLabel>
        <SelectTrigger>
          <SelectValueText placeholder={t('printMap.selectPrintLayout')} />
        </SelectTrigger>
        <SelectContent>
          {LAYOUTS.map((item) => (
            <SelectItem key={item} item={item} onClick={() => setLayout(item)}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>

      {/* Loading spinner */}
      {loading && (
        <Flex justify="center" align="center" gap={2}>
          <Spinner />
          <Text>{t('printMap.loading')}</Text>
        </Flex>
      )}

      {/* Action buttons */}
      <Flex justify="flex-end" gap={3}>
        <Button onClick={handleQuickPrint} colorPalette="green" disabled={loading}>
          {t('printMap.quickPrint')}
        </Button>
        <Button onClick={() => generate(map, overlayRef)} colorPalette="green" disabled={loading}>
          {t('printMap.downloadPdf')}
        </Button>
      </Flex>
    </Flex>
  );
}
