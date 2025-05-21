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
    <Box ref={mapRef} id="map" style={{ width: '100%', height: '100vh' }} />
  );
};
