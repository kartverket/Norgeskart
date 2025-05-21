import { Box } from '@kvib/react';
import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import { useMap } from './mapHooks.ts';

export const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  const { setTargetElement } = useMap();

  useEffect(() => {
    if (mapRef.current) {
      setTargetElement(mapRef.current);
    }
  }, [setTargetElement, mapRef]);

  return (
    <Box position={'relative'} width="100%" height="100%">
      <Box ref={mapRef} id="map" style={{ width: '100%', height: '100vh' }} />
      {/* Overlay */}
      <Box position="absolute" bottom="16px" left="16px" zIndex={10}>
        <a
          href="https://www.kartverket.no"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/assets/logos/KV_logo_staa.svg"
            alt="Logo"
            style={{ height: 64 }}
          />
        </a>
      </Box>
    </Box>
  );
};
