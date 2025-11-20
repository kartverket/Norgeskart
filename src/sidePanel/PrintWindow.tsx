import { Box, Button, Flex, Heading, Text, Spinner, toaster } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { mapAtom } from '../map/atoms';
import { useEffect, useRef, useState } from 'react';

import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { createBox } from 'ol/interaction/Draw';
import { Style, Stroke, Fill } from 'ol/style';
import {generateMapPdf} from './GeneratePrintPdf'

let drawInteraction: Draw | null = null;
let drawSource: VectorSource | null = null;
let drawLayer: VectorLayer<VectorSource> | null = null;

interface PrintWindowProps {
  onClose: () => void;
}

const PrintWindow = ({ onClose }: PrintWindowProps) => {
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const [hasSelection, setHasSelection] = useState(false);

  let printIframe: HTMLIFrameElement | null = null;
  let cleanupTimeout: number | null = null;

   useEffect(() => {
    if (!map || !overlayRef.current) return;

    const mapContainer = map.getViewport().parentElement;

    if (mapContainer && overlayRef.current.parentElement !== mapContainer) {
      mapContainer.appendChild(overlayRef.current);
    }

    return () => {
      if (
        mapContainer &&
        overlayRef.current &&
        overlayRef.current.parentElement === mapContainer
      ) {
      mapContainer.removeChild(overlayRef.current);
      }
    };
  }, [map]);

  const handlePrintArea = async (extent: number[]) => {
    if (!map || !overlayRef.current) return;
    setLoading(true);

    // Get overlay div position relative to map viewport
    const overlayRect = overlayRef.current.getBoundingClientRect();
    const mapRect = map.getViewport().getBoundingClientRect();

    // Compute pixel coordinates relative to the map viewport
    const left = overlayRect.left - mapRect.left;
    const top = overlayRect.top - mapRect.top;
    const width = overlayRect.width;
    const height = overlayRect.height;

    // Convert pixel coordinates to map coordinates
    const topLeftCoord = map.getCoordinateFromPixel([left, top]);
    const bottomRightCoord = map.getCoordinateFromPixel([left + width, top + height]);

    // Now pass this bbox to generateMapPdf (instead of center + scale)
    await generateMapPdf({
      map,
      overlayRef,
      setLoading,
      t
    });
  };

  const handlePrint = async () => {
    if (!map) return;

    setLoading(true);

    await generateMapPdf({
      map,
      overlayRef: { current: map.getViewport() as HTMLElement },
      setLoading,
      t,
    });
  };

  const handleSelectPrintArea = () => {
    if (!map) return;

    if (drawInteraction) map.removeInteraction(drawInteraction);

    if (!drawSource) {
      drawSource = new VectorSource();
      drawLayer = new VectorLayer({
        source: drawSource,
        style: new Style({
          stroke: new Stroke({ color: '#007bff', width: 2 }),
          fill: new Fill({ color: 'rgba(0, 123, 255, 0.1)' }),
        }),
      });
      map.addLayer(drawLayer);
    }

    drawSource.clear();

    drawInteraction = new Draw({
      source: drawSource,
      type: 'Circle',
      geometryFunction: createBox(),
    });
    map.addInteraction(drawInteraction);

    drawInteraction.once('drawend', async (event) => {
      const geometry = event.feature?.getGeometry();
      if (!geometry) {
        toaster.create({ title: 'Could not determine selected area', type: 'error' });
        return;
      }

      const extent = geometry.getExtent();
      setHasSelection(true);

      if (drawInteraction) {
        map.removeInteraction(drawInteraction);
        drawInteraction = null;
      }

      // Call PDF generator automatically after selecting
      await handlePrintArea(extent);
    });
  };

  const handleClearSelection = () => {
    if (drawSource) drawSource.clear();
    if (drawLayer && map) map.removeLayer(drawLayer);
    drawInteraction = null;
    drawSource = null;
    drawLayer = null;
    setHasSelection(false);
    toaster.create({ title: t('Selection cleared') || 'Selection cleared', type: 'info' });
  };

  const handleClose = () => {
    if (cleanupTimeout) clearTimeout(cleanupTimeout);
    if (printIframe) {
      document.body.removeChild(printIframe);
      printIframe = null;
    }
    setLoading(false);
    onClose();
  };

  return (
    <>
    <Box
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      background="white"
      border="1px solid #ddd"
      borderRadius="8px"
      boxShadow="0 2px 10px rgba(0,0,0,0.15)"
      p={6}
      zIndex={1000}
      width={{ base: '90%', md: '400px' }}
    >
      <Heading as="h3" size="md" mb={3}>
        {t('Print map') || 'Print map'}
      </Heading>

      <Text fontSize="sm" mb={4}>
        {t('Click the button below to print the visible map.')}
      </Text>

      {loading && (
        <Flex justifyContent="center" alignItems="center" mb={3} gap={2}>
          <Spinner />
          <Text>Loading map tiles...</Text>
        </Flex>
      )}

      <Flex justifyContent="flex-end" gap={3}>
        <Button onClick={handleClose} variant="ghost" colorPalette="gray" disabled={loading}>
          {t('Cancel') || 'Cancel'}
        </Button>

        <Button onClick={handleSelectPrintArea} colorPalette="blue" disabled={loading}>
          {t('Select print area') || 'Select print area'}
        </Button>

        {hasSelection && (
          <Button onClick={handleClearSelection} colorPalette="red" variant="outline">
            {t('Cancel selection') || 'Cancel selection'}
          </Button>
        )}

        <Button onClick={handlePrint} colorPalette="green" disabled={loading}>
          {t('Print or Save as PDF') || 'Print or Save as PDF'}
        </Button>
      </Flex>
    </Box>
    <div
      ref={overlayRef}
      style={{
        position: "absolute",
        border: "2px dashed #007bff",
        background: "rgba(0, 123, 255, 0.1)",
        display: "none",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    ></div>
    </>
  );
};

export default PrintWindow;
