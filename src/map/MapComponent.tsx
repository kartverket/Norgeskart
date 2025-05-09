import { Box } from '@kvib/react';
import { View } from 'ol';
import Map from 'ol/Map.js';
import 'ol/ol.css';
import { useEffect } from 'react';
import { mapLayers } from './layers.ts';

export const MapComponent = () => {
  useEffect(() => {
    const map = new Map({
      target: 'map',
      view: new View({
        center: [570130, 7032300],
        zoom: 3,
      }),
    });
    map.addLayer(mapLayers.europaForenklet.layer);
    map.addLayer(mapLayers.topo.layer);

    return () => {
      map.setTarget(undefined);
    };
  }, []);
  return <Box id="map" style={{ width: '100%', height: '100vh' }} />;
};
