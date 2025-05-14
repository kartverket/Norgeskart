import { Box } from '@kvib/react';
import { View } from 'ol';
import Map from 'ol/Map.js';
import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import { mapLayers } from './layers.ts';
import { useAtomValue } from 'jotai';
import { projectionAtom} from './atoms.ts';

export const MapComponent = () => {
  const projection = useAtomValue(projectionAtom);

  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    const map = new Map({
      target: mapRef.current,
      view: new View({
        center: [570130, 7032300],
        zoom: 3,        
      }),
    });
    map.addLayer(mapLayers.europaForenklet.getLayer(projection));
    map.addLayer(mapLayers.newTopo.getLayer(projection));
    

    return () => {
      map.setTarget(undefined);
      map.dispose();
      mapRef.current = null;
    };
  }, [projection]);
  return <Box ref = {mapRef} id="map" style={{ width: '100%', height: '100vh' }} />;
};
