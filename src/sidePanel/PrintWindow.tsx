import { Box, Button, Flex, Heading, Text, Spinner, toaster } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { mapAtom } from '../map/atoms';
import { useState, useRef, useEffect } from 'react';

interface PrintWindowProps {
  onClose: () => void;
}

//----------------------------testing api----------------------------


const generateMapPdf = async () => {
  console.log("📤 Starting PDF generation...");

    // URL params for footer
  const urlParams = new URLSearchParams(window.location.search);
  const lon = parseFloat(urlParams.get('lon') || '');
  const lat = parseFloat(urlParams.get('lat') || '');
  const pos = `${lon.toFixed(2)}, ${lat.toFixed(2)}`;

  const payload = {
    attributes: {
      map: {
        center: [lon, lat],
        dpi: 128,
        layers: [
          {
            baseURL: "https://api.norgeskart.no/v1/matrikkel/wms",
            customParams: {
              TRANSPARENT: "true",
              CQL_FILTER: "BYGNINGSTATUS<9 OR BYGNINGSTATUS=13"
            },
            imageFormat: "image/png",
            layers: ["matrikkel:BYGNINGWFS"],
            opacity: 1,
            type: "WMS"
          },
          {
            baseURL: "https://api.norgeskart.no/v1/matrikkel/wms",
            customParams: {
              TRANSPARENT: "true"
            },
            imageFormat: "image/png",
            layers: ["matrikkel:MATRIKKELADRESSEWFS,matrikkel:VEGADRESSEWFS"],
            opacity: 1,
            type: "WMS"
          },
          {
            baseURL: "https://cache.kartverket.no/v1/service",
            customParams: {
              TRANSPARENT: "true"
            },
            style: "default",
            imageFormat: "image/png",
            layer: "topo",
            opacity: 1,
            type: "WMTS",
            dimensions: null,
            requestEncoding: "KVP",
            dimensionParams: {},
            matrixSet: "utm33n",
            matrices: [
              { identifier: "0", scaleDenominator: 77371428.57142858, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [1, 1] },
              { identifier: "1", scaleDenominator: 38685714.28571429, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [2, 2] },
              { identifier: "2", scaleDenominator: 19342857.142857146, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [4, 4] },
              { identifier: "3", scaleDenominator: 9671428.571428573, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [8, 8] },
              { identifier: "4", scaleDenominator: 4835714.285714286, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [16, 16] },
              { identifier: "5", scaleDenominator: 2417857.142857143, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [32, 32] },
              { identifier: "6", scaleDenominator: 1208928.5714285716, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [64, 64] },
              { identifier: "7", scaleDenominator: 604464.2857142858, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [128, 128] },
              { identifier: "8", scaleDenominator: 302232.1428571429, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [256, 256] },
              { identifier: "9", scaleDenominator: 151116.07142857145, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [512, 512] },
              { identifier: "10", scaleDenominator: 75558.03571428572, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [1024, 1024] },
              { identifier: "11", scaleDenominator: 37779.01785714286, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [2048, 2048] },
              { identifier: "12", scaleDenominator: 18889.50892857143, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [4096, 4096] },
              { identifier: "13", scaleDenominator: 9444.754464285716, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [8192, 8192] },
              { identifier: "14", scaleDenominator: 4722.377232142858, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [16384, 16384] },
              { identifier: "15", scaleDenominator: 2361.188616071429, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [32768, 32768] },
              { identifier: "16", scaleDenominator: 1180.5943080357144, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [65536, 65536] },
              { identifier: "17", scaleDenominator: 590.2971540178572, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [131072, 131072] },
              { identifier: "18", scaleDenominator: 295.1485770089286, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [262144, 262144] }
            ]
          }
        ],
        rotation: 0,
        projection: "EPSG:25833",
        scale: 10000
      },
      pos: pos,
      scale_string: "1:25000",
      title: ""
    },
    layout: "1_A4_portrait",
    outputFormat: "pdf",
    outputFilename: "norgeskart-utskrift"
  };

  console.log("📦 Payload ready:", payload);

  try {
    const response = await fetch("https://ws.geonorge.no/print/kv/report.pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("✅ Initial response:", result);

    if (!result.statusURL) {
      console.error("❌ No status URL returned.");
      return;
    }

    const statusUrl = `https://ws.geonorge.no${result.statusURL}`;
    console.log("📡 Polling status at:", statusUrl);

    // Poll every 2 seconds until done
    const pollStatus = async () => {
      const statusResponse = await fetch(statusUrl);
      const statusResult = await statusResponse.json();
      console.log("📊 Status check:", statusResult);

      if (
        statusResult.done === true &&
        statusResult.status === "finished"
      ) {
        const finalUrl = `https://ws.geonorge.no${statusResult.downloadURL}`;
        console.log("✅ PDF ready at:", finalUrl);
        window.open(finalUrl, "_blank");
      } else {
        console.log("⏳ Still processing...");
        setTimeout(pollStatus, 2000);
      }
    };

    pollStatus();
  } catch (error) {
    console.error("❌ Failed to generate or poll PDF:", error);
  }
};

<button onClick={generateMapPdf}>Generate Map PDF</button>

// ----------------------------testing api----------------------------

export function getDpiMetrics() {
  const dpi = window.devicePixelRatio * 96; // 96 DPI standard
  const mmToPx = (mm: number) => (mm / 25.4) * dpi;

  const a4WidthPx = mmToPx(210); // Always portrait width
  const a4HeightPx = mmToPx(297 + 8); // Always portrait height + footer

  // Overlay size: scale down for screen preview, but keep aspect ratio
  const scaleFactor = Math.min(
    window.innerWidth / a4WidthPx,
    window.innerHeight / a4HeightPx,
    0.8 // max 80% of screen
  );

  const overlayWidth = a4WidthPx * scaleFactor;
  const overlayHeight = a4HeightPx * scaleFactor;

  return {
    dpi,
    mmToPx,
    a4WidthPx,
    a4HeightPx,
    overlayWidth,
    overlayHeight,
  };
}

const PrintWindow = ({ onClose }: PrintWindowProps) => {
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // DPI and size conversions
  const {
    a4WidthPx,
    a4HeightPx,
    overlayWidth,
    overlayHeight,
  } = getDpiMetrics();

  // Center overlay initially (will position in map container pixels)
  const [overlayPosition, setOverlayPosition] = useState({ x: 100, y: 100 }); // Default starting pos

  // URL params for footer
  const urlParams = new URLSearchParams(window.location.search);
  const lon = parseFloat(urlParams.get('lon') || '').toFixed(2);
  const lat = parseFloat(urlParams.get('lat') || '').toFixed(2);
  // const projection = urlParams.get('projection') || '';
  const projection = map.getView().getProjection().getCode();

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
      printCanvas.height = a4HeightPx + 2; // Leave space for footer
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
      
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`Senterposisjon:`, 0, a4HeightPx - 24);
      ctx.fillText(`${lon}, ${lat}`, 100, a4HeightPx - 24);
      ctx.fillText(`Koordinatsystem: `, 0, a4HeightPx - 12);
      ctx.fillText(`${projection}`, 100, a4HeightPx - 12);
      const date = new Date().toLocaleDateString('no-NO');
      ctx.fillText(`Utskriftsdato:`, 0, a4HeightPx);
      ctx.fillText(`${date}`, 100, a4HeightPx);

      // Footer logo (bottom right)
      const logo = new Image();
      logo.src = `${window.location.origin}/logos/KV_logo_staa_color.svg`;
      logo.onload = () => {
        const logoHeight = 35;
        const logoWidth = (logo.width / logo.height) * logoHeight;
        ctx.drawImage(logo, a4WidthPx - logoWidth, a4HeightPx - logoHeight - 1, logoWidth, logoHeight);

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
        <Button onClick={generateMapPdf} colorPalette="green" disabled={loading}>
          {t('Generate Map PDF')}
        </Button>
      </Flex>

      {/* This div is appended to the map container */}
      <div ref={overlayRef} />
    </Box>
  );
};

export default PrintWindow;
