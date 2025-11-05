import { Box, Button, Flex, Heading, Text, Spinner, toaster } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { mapAtom } from '../map/atoms';
import { useState, useRef, useEffect } from 'react';

interface PrintWindowProps {
  onClose: () => void;
}

const PrintWindow = ({ onClose }: PrintWindowProps) => {
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // DPI and size conversions
  const dpi = window.devicePixelRatio * 96; // 96 DPI standard
  const mmToPx = (mm: number) => (mm / 25.4) * dpi;
  const a4WidthPx = mmToPx(210);
  const a4HeightPx = mmToPx(297+8); // Extra 8mm for footer

  // Overlay size on screen smaller than full A4 for easier dragging:
  // Let's say 80% of A4 size visually on screen
  const overlayWidth = a4WidthPx * 0.40;
  const overlayHeight = a4HeightPx * 0.40;

  // Center overlay initially (will position in map container pixels)
  const [overlayPosition, setOverlayPosition] = useState({ x: 100, y: 100 }); // Default starting pos

  // URL params for footer
  const urlParams = new URLSearchParams(window.location.search);
  const lon = urlParams.get('lon') || '';
  const lat = urlParams.get('lat') || '';
  const projection = urlParams.get('projection') || '';

  // Center the overlay on the map viewport when map is ready
  useEffect(() => {
    if (!map) return;

    const mapContainer = map.getViewport();
    const mapRect = mapContainer.getBoundingClientRect();

    // Center overlay position inside the map container (using CSS pixels)
    setOverlayPosition({
      x: mapRect.width / 2 - overlayWidth / 2,
      y: mapRect.height / 2 - overlayHeight / 2,
    });
  }, [map, overlayWidth, overlayHeight]);

  // Attach overlay to map viewport and style it
  useEffect(() => {
    if (!map) return;

    const mapContainer = map.getViewport();
    const overlay = overlayRef.current;
    if (!overlay) return;

    // Remove existing overlays (clean up)
    mapContainer.querySelectorAll('.print-overlay').forEach(el => el.remove());

    overlay.classList.add('print-overlay');
    overlay.style.position = 'absolute';
    overlay.style.top = `${overlayPosition.y}px`;
    overlay.style.left = `${overlayPosition.x}px`;
    overlay.style.width = `${overlayWidth}px`;
    overlay.style.height = `${overlayHeight}px`;
    overlay.style.border = '2px dashed blue';
    overlay.style.cursor = 'move';
    overlay.style.zIndex = '1000';
    overlay.style.background = 'rgba(0,0,255,0.05)';

    mapContainer.appendChild(overlay);

    return () => {
      if (overlay.parentElement === mapContainer) {
        mapContainer.removeChild(overlay);
      }
    };
  }, [map, overlayPosition, overlayWidth, overlayHeight]);

  // Drag logic for overlay - disables map drag while dragging
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !map) return;

    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;

    const interactions = map.getInteractions();

    const disableMapDragging = () => {
      interactions.forEach(i => {
        if (i.getActive() && i.constructor.name.includes('DragPan')) {
          i.setActive(false);
        }
      });
    };

    const enableMapDragging = () => {
      interactions.forEach(i => {
        if (i.getActive !== undefined && i.constructor.name.includes('DragPan')) {
          i.setActive(true);
        }
      });
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // left click only
      isDragging = true;
      offsetX = e.clientX - overlay.offsetLeft;
      offsetY = e.clientY - overlay.offsetTop;
      disableMapDragging();
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      // Keep overlay inside map container bounds
      const mapContainer = map.getViewport();
      const mapRect = mapContainer.getBoundingClientRect();

      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;

      // Clamp to container bounds (prevent dragging outside)
      newX = Math.max(0, Math.min(newX, mapRect.width - overlayWidth));
      newY = Math.max(0, Math.min(newY, mapRect.height - overlayHeight));

      setOverlayPosition({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      if (isDragging) enableMapDragging();
      isDragging = false;
    };

    overlay.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      overlay.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [map, overlayWidth, overlayHeight]);

  const printMap = async () => {
    if (!map) return;
    setLoading(true);

    map.once('rendercomplete', () => {
      const mapCanvas = map.getViewport().querySelector('canvas') as HTMLCanvasElement | null;
      if (!mapCanvas) {
        toaster.create({ title: 'Map canvas not found', type: 'error' });
        setLoading(false);
        return;
      }

      const printCanvas = document.createElement('canvas');
      printCanvas.width = a4WidthPx;
      printCanvas.height = a4HeightPx + 3; // Leave space for footer
      const ctx = printCanvas.getContext('2d');
      if (!ctx) return;

      if (overlayRef.current) {
        const overlayRect = overlayRef.current.getBoundingClientRect();
        const mapRect = mapCanvas.getBoundingClientRect();

        const scaleX = mapCanvas.width / mapRect.width;
        const scaleY = mapCanvas.height / mapRect.height;

        // Crop source coords in map canvas pixels
        const sx = (overlayRect.left - mapRect.left) * scaleX;
        const sy = (overlayRect.top - mapRect.top) * scaleY;
        const sw = overlayRect.width * scaleX;
        const sh = overlayRect.height * scaleY;

        // Draw cropped image scaled to full A4 print canvas size
        ctx.drawImage(mapCanvas, sx, sy, sw, sh, 0, 0, printCanvas.width, printCanvas.height - 42);
      }

      // Footer text
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';

      const scaleText = document.querySelector('.ol-scale-line-inner')?.textContent || '';

      const paddingX = 8;
      const paddingY = 4;
      const textWidth = ctx.measureText(scaleText).width;
      const boxWidth = textWidth + paddingX * 2;
      const boxHeight = 12 + paddingY * 2;

      const x = (printCanvas.width - boxWidth) / 2; // center horizontally
      const y = a4HeightPx - 25; // vertical position above footer

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(x, y, boxWidth, boxHeight);

      ctx.strokeStyle = '#666'; // approximate subtle foreground
      ctx.beginPath();

      // Left border
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + boxHeight);

      // Right border
      ctx.moveTo(x + boxWidth, y);
      ctx.lineTo(x + boxWidth, y + boxHeight);

      // Bottom border
      ctx.moveTo(x, y + boxHeight);
      ctx.lineTo(x + boxWidth, y + boxHeight-1);

      ctx.stroke();

      ctx.fillStyle = '#000'; // foreground color
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(scaleText, x + boxWidth / 2, y + boxHeight / 2);


      ctx.fillText(`Senterposisjon: ${lon}, ${lat}`, 6, a4HeightPx - 25);
      ctx.fillText(`Koordinatsystem: ${projection}`, 6, a4HeightPx - 13);
      const date = new Date().toLocaleDateString('no-NO');
      ctx.fillText(`Utskriftsdato: ${date}`, 6, a4HeightPx - 1);

      // Footer logo (bottom right)
      const logo = new Image();
      logo.src = `${window.location.origin}/logos/KV_logo_staa_color.svg`;
      logo.onload = () => {
        const logoHeight = 35;
        const logoWidth = (logo.width / logo.height) * logoHeight;
        ctx.drawImage(logo, a4WidthPx - logoWidth - 20, a4HeightPx - logoHeight - 1, logoWidth, logoHeight);

        // Open print window
        const printWindow = window.open('', '_blank', 'width=800,height=1000');
        if (!printWindow) return;
        const img = printCanvas.toDataURL('image/png');
        printWindow.document.body.style.margin = '0';
        printWindow.document.body.style.background = 'white';
        const printImg = new Image();
        printImg.src = img;
        printImg.style.width = '100%';
        printImg.style.height = 'auto';
        printWindow.document.body.appendChild(printImg);
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };

      setLoading(false);
    });

    map.renderSync();
  };

  const handleClose = () => {
    setLoading(false);
    if (overlayRef.current && overlayRef.current.parentElement) {
      overlayRef.current.parentElement.removeChild(overlayRef.current);
    }
    onClose();
  };

  return (
    <Box
      position="absolute"
      top="50%"
      left={{ base: '50%', md: '0px' }}
      transform="translateY(-50%)"
      background="white"
      border="1px solid #ddd"
      borderRadius="8px"
      boxShadow="0 2px 10px rgba(0,0,0,0.15)"
      p={6}
      zIndex={1001}
      width={{ base: '100%', md: '400px' }}
    >
      <Flex alignItems="center" gap={3} mb={3}>
        <Heading as="h3" size="md">{t('Print map')}</Heading>
      </Flex>

      <Text fontSize="sm" mb={4}>
        {t('Drag the A4 box over the map to select the area to print.')}
      </Text>

      {loading && (
        <Flex justifyContent="center" alignItems="center" mb={3} gap={2}>
          <Spinner />
          <Text>Loading map tiles...</Text>
        </Flex>
      )}

      <Flex justifyContent="flex-end" gap={3}>
        <Button onClick={handleClose} variant="ghost" colorPalette="gray" disabled={loading}>
          {t('Cancel')}
        </Button>
        <Button onClick={printMap} colorPalette="green" disabled={loading}>
          {t('Print or Save as PDF')}
        </Button>
      </Flex>

      {/* This div is appended to the map container */}
      <div ref={overlayRef} />
    </Box>
  );
};

export default PrintWindow;
