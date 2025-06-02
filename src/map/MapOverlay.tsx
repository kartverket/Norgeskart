import { Box, IconButton } from '@kvib/react';
import { useMapSettings } from './mapHooks';

export const MapOverlay = () => {
  const { setMapFullScreen } = useMapSettings();

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
      {document.fullscreenEnabled && (
        <Box position="absolute" top="16px" right="16px" zIndex={10}>
          <IconButton
            onClick={() => {
              setMapFullScreen(true);
            }}
            variant="ghost"
            icon={'fullscreen'}
          />
        </Box>
      )}
    </>
  );
};
