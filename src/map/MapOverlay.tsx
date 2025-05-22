import { Box } from '@kvib/react';

export const MapOverlay = () => {
  return (
    <Box position="absolute" bottom="16px" left="16px" zIndex={10}>
      <a
        href="https://www.kartverket.no"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src="/logos/KV_logo_staa.svg" alt="Logo" style={{ height: 64 }} />
      </a>
    </Box>
  );
};
