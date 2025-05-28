import { Box, Button, VStack } from '@kvib/react';
import { DrawControls } from './draw/DrawControls';
import { useMapSettings } from './mapHooks';

export const MapOverlay = () => {
  const { drawEnabled, toggleDrawEnabled } = useMapSettings();

  return (
    <>
      <Box position="absolute" bottom="16px" left="16px" zIndex={10}>
        <a
          href="https://www.kartverket.no"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/logos/KV_logo_staa.svg"
            alt="Logo"
            style={{ height: 64 }}
          />
        </a>
      </Box>
      <Box position={'absolute'} top={'16px'} right={'16px'}>
        <VStack
          backgroundColor={'rgba(255, 255, 255, 0.6)'}
          padding={4}
          borderRadius={'8px'}
        >
          <Button
            onClick={toggleDrawEnabled}
            leftIcon={drawEnabled ? 'close' : 'draw'}
            variant="primary"
          >
            {drawEnabled ? 'Ferdig å tegne' : 'Tegn på kartet'}
          </Button>
          {drawEnabled && <DrawControls />}
        </VStack>
      </Box>
    </>
  );
};
