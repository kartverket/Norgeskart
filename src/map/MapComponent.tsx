import { Box } from '@kvib/react';
import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import { useMap } from './mapHooks.ts';
import { MapOverlay } from './MapOverlay.tsx';

export const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  const { setTargetElement } = useMap();

  useEffect(() => {
    if (mapRef.current) {
      setTargetElement(mapRef.current);
    }
    return () => {
      setTargetElement(null);
    };
  }, [setTargetElement, mapRef]);

  return (
    <Box position={'relative'} width="100%" height="100%">
      <Box ref={mapRef} id="map" style={{ width: '100%', height: '100vh' }} />
      <MapOverlay />
    </Box>
  );
};
