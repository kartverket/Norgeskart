import { Box, Button, Flex, Heading, Text, Spinner, toaster } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { mapAtom } from '../map/atoms';
import { useState } from 'react';

import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { createBox } from 'ol/interaction/Draw';
import { Style, Stroke, Fill } from 'ol/style';
import { PrintRequestBody } from './PrintRequestBody';

let drawInteraction: Draw | null = null;
let drawSource: VectorSource | null = null;
let drawLayer: VectorLayer<VectorSource> | null = null;

interface PrintWindowProps {
  onClose: () => void;
}

const GetMap = async () => {
  const baseUrl = "https://ws.geonorge.no"
  try {
    const printRequestBody = PrintRequestBody.fromJSON(data).toJSON()
    const response = await fetch("https://ws.geonorge.no/print/kv/report.pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: 
    })
    const data = await response.json();
    console.log("Response JSON:", data);
    
    while (true) {
      const res = await fetch(baseUrl + data.downloadURL)

      if (res.ok && res.headers.get("content-type")?.includes("application/pdf")) {
        const blob = await res.blob();
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, "_blank");

        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "map.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("Pdf opened and downloaded");
        break; // stop polling
      }
    } 
  } catch (err) {
    console.warn("Waiting for Pdf...", err);
  }
};

const PrintWindow = ({ onClose }: PrintWindowProps) => {
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const [loading, setLoading] = useState(false);

  const [hasSelection, setHasSelection] = useState(false);

  let printIframe: HTMLIFrameElement | null = null;
  let cleanupTimeout: number | null = null;

  const handlePrintArea = (extent: number[]) => {
    if (!map) return;
    setLoading(true);

    const view = map.getView();
    const originalCenter = view.getCenter();
    const originalZoom = view.getZoom();

    view.fit(extent, { size: map.getSize(), padding: [0, 0, 0, 0] });

    map.once('rendercomplete', () => {
      setTimeout(() => {
        const mapCanvas = map.getViewport().querySelector('canvas') as HTMLCanvasElement | null;
        if (!mapCanvas) {
          toaster.create({ title: 'Failed to find map canvas', type: 'error' });
          setLoading(false);
          return;
        }

        try {
          const dataUrl = mapCanvas.toDataURL('image/png');
          const logoUrl = 'https://www.kartverket.no/images/logo.svg';

          const printIframe = document.createElement('iframe');
          printIframe.style.position = 'fixed';
          printIframe.style.width = '0';
          printIframe.style.height = '0';
          printIframe.style.border = '0';
          document.body.appendChild(printIframe);

          const doc = printIframe.contentWindow?.document;
          if (!doc) return;

          doc.open();
          doc.write(`
            <html>
              <head>
                <title>Print Selected Map Area</title>
                <style>
                  @page { size: A4 landscape; margin: 1cm; }
                  body { font-family: Arial; text-align: center; margin:0; padding:0; }
                  header { display:flex; justify-content:center; align-items:center; margin-bottom:10px; }
                  header img { height:40px; margin-right:10px; }
                  header h1 { margin:0; font-size:20px; }
                  .map-container { display:flex; justify-content:center; align-items:center; height:80vh; }
                  .map-container img { max-width:95%; max-height:100%; border:1px solid #ccc; }
                  footer { font-size:10px; color:#555; margin-top:10px; }
                </style>
              </head>
              <body>
                <header>
                  <img src="${logoUrl}" alt="Kartverket logo"/>
                  <h1>Selected Map Area</h1>
                </header>
                <div class="map-container">
                  <img src="${dataUrl}" alt="Selected Area"/>
                </div>
                <footer>
                  © Kartverket data | Printed on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
                </footer>
              </body>
            </html>
          `);
          doc.close();

          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();

          setTimeout(() => {
            if (originalCenter && originalZoom) {
              view.setCenter(originalCenter);
              view.setZoom(originalZoom);
            }
            document.body.removeChild(printIframe);
            setLoading(false);
          }, 1500);
        } catch (err) {
          console.error('Failed to capture map image:', err);
          toaster.create({ title: 'Failed to capture map image', type: 'error' });
          setLoading(false);
        }
      }, 500);
    });

    map.renderSync();
  };

  const handlePrint = () => {
    if (!map) return;

    if (drawSource && drawSource.getFeatures().length > 0) {
      const feature = drawSource.getFeatures()[0];
      const extent = feature.getGeometry()?.getExtent();
      if (extent) {
        handlePrintArea(extent);
        return;
      }
    }

    setLoading(true);
    map.once('rendercomplete', () => {
      const mapCanvas = map.getViewport().querySelector('canvas') as HTMLCanvasElement | null;
      if (!mapCanvas) {
        console.error('Map canvas not found!');
        setLoading(false);
        return;
      }

      const dataUrl = mapCanvas.toDataURL('image/png');
      const logoUrl = 'https://www.kartverket.no/images/logo.svg';

      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      document.body.appendChild(printIframe);

      const doc = printIframe.contentWindow?.document;
      if (!doc) return;

      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Print Map</title>
            <style>
              @page { size: A4 landscape; margin: 1cm; }
              body { font-family: Arial; text-align: center; margin:0; padding:0; }
              header { display:flex; justify-content:center; align-items:center; margin-bottom:10px; }
              header img { height:40px; margin-right:10px; }
              header h1 { margin:0; font-size:20px; }
              .map-container { display:flex; justify-content:center; align-items:center; height:80vh; }
              .map-container img { max-width:95%; max-height:100%; border:1px solid #ccc; }
              footer { font-size:10px; color:#555; margin-top:10px; }
            </style>
          </head>
          <body>
            <header>
              <img src="${logoUrl}" alt="Kartverket logo"/>
              <h1>Full Map View</h1>
            </header>
            <div class="map-container">
              <img src="${dataUrl}" alt="Map"/>
            </div>
            <footer>
              © Kartverket data | Printed on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
            </footer>
          </body>
        </html>
      `);
      doc.close();

      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();

      setTimeout(() => {
        document.body.removeChild(printIframe);
        setLoading(false);
      }, 1500);
    });

    map.renderSync();
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

    drawInteraction.once('drawend', (event) => {
      const geometry = event.feature?.getGeometry();
      if (!geometry) {
        toaster.create({ title: 'Could not determine selected area', type: 'error' });
        return;
      }

      const extent = geometry.getExtent();

      if (drawInteraction) {
        map.removeInteraction(drawInteraction);
        drawInteraction = null;
      }

      setHasSelection(true);

      GetMap();
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
  );
};

export default PrintWindow;
