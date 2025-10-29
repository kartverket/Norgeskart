import { Box, Button, Flex, Heading, Text, toaster } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { mapAtom } from '../map/atoms';

interface PrintWindowProps {
  onClose: () => void;
}

const PrintWindow = ({ onClose }: PrintWindowProps) => {
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);

  const handlePrint = () => {
    if (!map) return;

    map.renderSync();
    const mapCanvas = map.getViewport().querySelector('canvas') as HTMLCanvasElement | null;
    if (!mapCanvas) {
      console.error('Map canvas not found!');
      return;
    }

    try {
      const dataUrl = mapCanvas.toDataURL('image/png');
      const logoUrl = 'https://www.kartverket.no/images/logo.svg';

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
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
              <h1>Printing Features Test</h1>
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

      // Print immediately
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);

    } catch (err) {
      console.error('Failed to export map', err);
      toaster.create({ title: 'Failed to export map', type: 'error' });
    }
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

      <Flex justifyContent="flex-end" gap={3}>
        <Button onClick={onClose} variant="ghost" colorPalette="gray">
          {t('Cancel') || 'Cancel'}
        </Button>
        <Button onClick={handlePrint} colorPalette="green">
          {t('Print or Save as PDF') || 'Print or Save as PDF'}
        </Button>
      </Flex>
    </Box>
  );
};

export default PrintWindow;