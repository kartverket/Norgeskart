import { Box } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { View } from 'ol';
import Map from 'ol/Map.js';
import 'ol/ol.css';
import { get as getProjection } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { useEffect, useRef } from 'react';
import { projectionAtom } from './atoms.ts';
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

getProjection('EPSG:25832')?.setExtent([166021.44, 0.00, 534994.66, 9329005.18])
getProjection('EPSG:25833')?.setExtent([500000.00, 0.00, 833978.56, 9329005.18])
getProjection('EPSG:25835')?.setExtent([166021.44, 0.00, 534994.66, 9329005.18])


export const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const projectionId = useAtomValue(projectionAtom);
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
      map.addLayer(mapLayers.europaForenklet.getLayer(projectionId));
    } catch (error) {
      console.error('Error adding europaForenklet layer:', error);
    }

    try {
      map.addLayer(mapLayers.newTopo.getLayer(projectionId));
    } catch (error) {
      console.error('Error adding newTopo layer:', error);
    }

    mapInstance.current = map;
  }, [projectionId]);

  return (
    <Box ref={mapRef} id="map" style={{ width: '100%', height: '100vh' }} />
  );
};
