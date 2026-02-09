import { atom } from 'jotai';
import { View } from 'ol';
import { defaults as defaultControls } from 'ol/control/defaults.js';
import Map from 'ol/Map';
import { get as getProjection } from 'ol/proj';

import { atomEffect } from 'jotai-effect';
import { v4 as uuidv4 } from 'uuid';
import { validateProjectionIdString } from '../shared/utils/enumUtils';
import { getUrlParameter, setUrlParameter } from '../shared/utils/urlUtils';
import { mapLayers } from './layers';
import { activeThemeLayersAtom } from './layers/atoms';
import { BackgroundLayerName } from './layers/backgroundLayers';
import { ControlPortal } from './mapControls';
import { scaleToResolution } from './mapScale';

export type ProjectionIdentifier =
  | 'EPSG:4326' // wgs84
  | 'EPSG:3857' // webmercator
  | 'EPSG:25832' // utm32n
  | 'EPSG:25833' // utm33n
  | 'EPSG:25834' // utm34n
  | 'EPSG:25835' // utm35n
  | 'EPSG:25836'; // utm36n

export const DEFAULT_PROJECTION: ProjectionIdentifier = 'EPSG:25833';
export const DEFAULT_ZOOM_LEVEL = 3;
export const DEFAULT_CENTER = [396722, 7197860]; // Center in EPSG:25833
export const DEFAULT_ROTATION = 0;

export const AvailableProjections: ProjectionIdentifier[] = [
  'EPSG:3857', // webmercator
  'EPSG:25832', // utm32n
  'EPSG:25833', // utm33n
  'EPSG:25835', // utm35n
];
export const mapOrientationAtom = atom<number>(0);
export const mapOrientationDegreesAtom = atom<number>((get) => {
  const radians = get(mapOrientationAtom);
  return (radians * 180) / Math.PI; // Convert radians to degrees
});

export const displayMapLegendAtom = atom<boolean>(false);
export const displayMapLegendControlAtom = atom<boolean>((get) => {
  const displayMapLegned = get(displayMapLegendAtom);
  const activeThemeLayers = get(activeThemeLayersAtom);
  return !displayMapLegned && activeThemeLayers.size > 0;
});
export const displayCompassOverlayAtom = atom<boolean>(false);
export const useMagneticNorthAtom = atom<boolean>(false);
export const magneticDeclinationAtom = atom<number>(0);

export const getBackgroundLayerImageName = (
  layerName: BackgroundLayerName,
): string => {
  switch (layerName) {
    case 'Nibcache_web_mercator_v2':
    case 'Nibcache_UTM32_EUREF89_v2':
    case 'Nibcache_UTM33_EUREF89_v2':
    case 'Nibcache_UTM35_EUREF89_v2':
      return 'Nibcache_web_mercator_v2';
    default:
      return layerName;
  }
};

const getInitialMapView = () => {
  const projectionIdFromUrl = validateProjectionIdString(
    getUrlParameter('projection'),
  );
  const projectionId = projectionIdFromUrl
    ? projectionIdFromUrl
    : DEFAULT_PROJECTION;

  const initialProjection = getProjection(projectionId)!;

  let initialZoom = DEFAULT_ZOOM_LEVEL;
  let initialCenter = DEFAULT_CENTER;
  let initialRotation = DEFAULT_ROTATION;

  const lon = getUrlParameter('lon');
  const lat = getUrlParameter('lat');
  if (lon != null && lat != null) {
    const parsedLon = parseFloat(lon);
    const parsedLat = parseFloat(lat);
    if (!Number.isNaN(parsedLon) && !Number.isNaN(parsedLat)) {
      initialCenter = [parsedLon, parsedLat];
    }
  }

  const zoom = getUrlParameter('zoom');
  if (zoom != null) {
    const parsedZoom = parseFloat(zoom);
    if (!Number.isNaN(parsedZoom)) {
      initialZoom = parsedZoom;
    }
  }
  const rotation = getUrlParameter('rotation');
  if (rotation != null) {
    const parsedRotation = parseFloat(rotation);
    if (!Number.isNaN(parsedRotation)) {
      initialRotation = parsedRotation;
    }
  }

  return new View({
    center: initialCenter,
    minZoom: 3,
    maxZoom: 20,
    zoom: initialZoom,
    rotation: initialRotation,
    projection: initialProjection,
    constrainResolution: false,
  });
};

export const mapAtom = atom<Map>(() => {
  const map = new Map({
    controls: defaultControls({ zoom: false }).extend([new ControlPortal()]),
  });

  map.addLayer(mapLayers.markerLayer.getLayer());
  map.addLayer(mapLayers.drawLayer.getLayer());
  map.addLayer(mapLayers.drawOverlayLayer.getLayer());
  map.addLayer(mapLayers.posterMarkerLayer.getLayer());

  const intialView = getInitialMapView();

  map.setView(intialView);
  map.on('moveend', (e) => {
    const view = e.map.getView();
    const center = view.getCenter();
    if (center) {
      setUrlParameter('lon', center[0].toString());
      setUrlParameter('lat', center[1].toString());
    }
    const rotation = view.getRotation();
    if (!Number.isNaN(rotation)) {
      setUrlParameter('rotation', rotation.toString());
    }
    const zoom = view.getZoom();
    if (zoom && !Number.isNaN(zoom)) {
      setUrlParameter('zoom', zoom.toString());
    }
  });
  const mapId = uuidv4();
  map.setProperties({ id: mapId });

  return map;
});

export const availableScales = [
  5000, 10000, 25000, 50000, 80000, 100000, 250000, 500000, 1000000,
];

export const scaleAtom = atom<number | null>(null);

export const scaleToResolutionEffect = atomEffect((get) => {
  const map = get(mapAtom);
  const scale = get(scaleAtom);
  if (!map || !scale) return;

  const view = map.getView();
  const resolution = scaleToResolution(scale, map);
  view.setResolution(resolution);
});
