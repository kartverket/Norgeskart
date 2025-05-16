import { Box } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { getUid, View } from 'ol';
import Map from 'ol/Map.js';
import 'ol/ol.css';
import { get as getProjection } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { useEffect, useRef } from 'react';
import { backgroundLayerAtom, projectionAtom } from './atoms.ts';
import { mapLayers } from './layers.ts';

// Register custom EPSG codes
proj4.defs(
  'EPSG:25832',
  '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
);
proj4.defs(
  'EPSG:25833',
  '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
);
proj4.defs(
  'EPSG:25835',
  '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
);

register(proj4);

getProjection('EPSG:25832')?.setExtent([
  -1866822.47, 3680224.65, 3246120.36, 9483069.2,
]);

getProjection('EPSG:25833')?.setExtent([
  -2450512.62, 3680451.78, 2665647.82, 9493779.8,
]);
getProjection('EPSG:25835')?.setExtent([
  -3646007.42, 3680723.36, 1528001.15, 9567789.69,
]);

export const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const baseLayerIdRef = useRef<string>(null);
  const backgroundLayerIdRef = useRef<string>(null);
  const projectionId = useAtomValue(projectionAtom);
  const backgroundLayerId = useAtomValue(backgroundLayerAtom);
  const mapInstance = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      console.error('Map ref is null');
      return;
    }

    return () => {
      if (mapInstance.current) {
        console.log('Cleaning up map');
        mapInstance.current.getLayers().clear();
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, [projectionId]);

  useEffect(() => {
    if (!mapRef.current) {
      console.error('Map ref is null');
      return;
    }

    const projection = getProjection(projectionId);

    if (!projection) {
      console.error(`Projection ${projectionId} not found`);
      return;
    }

    const map = new Map({
      target: mapRef.current,
      view: new View({
        center: [570130, 7032300],
        zoom: 3,
        projection: projection, // Use the registered projection
      }),
    });

    try {
      const europaLayer = mapLayers.europaForenklet.getLayer(projectionId);
      baseLayerIdRef.current = getUid(europaLayer);
      map.addLayer(europaLayer);
    } catch (error) {
      console.error('Error adding europaForenklet layer:', error);
    }

    try {
      const backgroundLayer =
        mapLayers.backgroundLayers[backgroundLayerId].getLayer(projectionId);
      backgroundLayerIdRef.current = getUid(backgroundLayer);
      map.addLayer(backgroundLayer);
    } catch (error) {
      console.error('Error adding newTopo layer:', error);
    }

    mapInstance.current = map;
  }, [backgroundLayerId, projectionId]);

  useEffect(() => {
    if (!mapInstance.current) {
      console.error('Map instance is null');
      return;
    }
    const allLayers = mapInstance.current.getLayers().getArray();

    const backgroundLayerIndex = mapInstance.current
      .getAllLayers()
      .findIndex((layer) => layer.get('id') === baseLayerIdRef.current);

    if (backgroundLayerIndex !== -1) {
      mapInstance.current.removeLayer(allLayers[backgroundLayerIndex]);
    }
    try {
      // Create the new background layer
      const newBackgroundLayer =
        mapLayers.backgroundLayers[backgroundLayerId].getLayer(projectionId);
      backgroundLayerIdRef.current = getUid(newBackgroundLayer);

      // Add the new background layer at the same index
      if (backgroundLayerIndex !== -1) {
        mapInstance.current
          .getLayers()
          .insertAt(backgroundLayerIndex, newBackgroundLayer);
      } else {
        // If no old layer was found, just add it to the map
        mapInstance.current.addLayer(newBackgroundLayer);
      }
    } catch (error) {
      console.error('Error adding new background layer:', error);
    }
  }, [projectionId, backgroundLayerId]);

  return (
    <Box ref={mapRef} id="map" style={{ width: '100%', height: '100vh' }} />
  );
};
