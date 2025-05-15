import { Box } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { View } from 'ol';
import Map from 'ol/Map.js';
import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import { projectionAtom } from './atoms.ts';
import { mapLayers } from './layers.ts';

export const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const projection = useAtomValue(projectionAtom);
  const mapInstance = useRef<Map | null>(null); // Store the map instance

  useEffect(() => {
    if (!mapRef.current) {
      console.error('Map ref is null');
      return;
    }

    // Cleanup function to remove layers and dispose of the map
    return () => {
      if (mapInstance.current) {
        console.log('Cleaning up map');
        mapInstance.current.getLayers().clear(); // Remove all layers
        mapInstance.current.setTarget(undefined); // Remove the target
        mapInstance.current = null; // Clear the map instance
      }
    };
  }, [projection]);

  useEffect(() => {
    if (!mapRef.current) {
      console.error('Map ref is null');
      return;
    }
    let map: Map;
    try {
      map = new Map({
        // Create a new map instance
        target: mapRef.current,
        view: new View({
          center: [570130, 7032300],
          zoom: 3,
          projection, // Set the projection
        }),
      });
    } catch (error) {
      console.error('Error creating map:', error);
      return;
    }

    // Add layers to the map
    try {
      map.addLayer(mapLayers.europaForenklet.getLayer(projection));
    } catch (error) {
      console.error('Error adding europaForenklet layer:', error);
    }

    try {
      map.addLayer(mapLayers.newTopo.getLayer(projection));
    } catch (error) {
      console.error('Error adding newTopo layer:', error);
    }

    // Store the map instance in the ref
    mapInstance.current = map;

    return () => {
      // Cleanup is handled in the other useEffect
    };
  }, [projection]);

  return (
    <Box ref={mapRef} id="map" style={{ width: '100%', height: '100vh' }} />
  );
};
