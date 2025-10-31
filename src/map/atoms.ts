import { atom } from 'jotai';
import { View } from 'ol';
import { defaults as defaultControls } from 'ol/control/defaults.js';
import ScaleLine from 'ol/control/ScaleLine.js';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import { get as getProjection } from 'ol/proj';

import { v4 as uuidv4 } from 'uuid';
import { validateProjectionIdString } from '../shared/utils/enumUtils';
import { getUrlParameter, setUrlParameter } from '../shared/utils/urlUtils';
import { mapLayers } from './layers';
import { ControlPortal, getMousePositionControl } from './mapControls';

const INITIAL_PROJECTION: ProjectionIdentifier = 'EPSG:3857';
export const DEFAULT_ZOOM_LEVEL = 5;
export const DEFAULT_CENTER = [1900000, 9500000]; // Center in EPSG:3857
export const DEFAULT_ROTATION = 0;

export const AvailableProjections: ProjectionIdentifier[] = [
  'EPSG:3857', // webmercator
  'EPSG:25832', // utm32n
  'EPSG:25833', // utm33n
  'EPSG:25835', // utm35n
];

export type ProjectionIdentifier =
  | 'EPSG:4326' // wgs84
  | 'EPSG:3857' // webmercator
  | 'EPSG:25832' // utm32n
  | 'EPSG:25833' // utm33n
  | 'EPSG:25835'; // utm35n
export const mapOrientationAtom = atom<number>(0);
export const mapOrientationDegreesAtom = atom<number>((get) => {
  const radians = get(mapOrientationAtom);
  return (radians * 180) / Math.PI; // Convert radians to degrees
});
export const displayCompassOverlayAtom = atom<boolean>(false);
export const useMagneticNorthAtom = atom<boolean>(false);
export const magneticDeclinationAtom = atom<number>(0);

const getInitialMapView = () => {
  const projectionIdFromUrl = validateProjectionIdString(
    getUrlParameter('projection'),
  );
  const projectionId = projectionIdFromUrl
    ? projectionIdFromUrl
    : INITIAL_PROJECTION;

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
    minZoom: 4,
    maxZoom: 20,
    zoom: initialZoom,
    rotation: initialRotation,
    projection: initialProjection,
    constrainResolution: true,
  });
};

export const mapAtom = atom<Map>(() => {
  const map = new Map({
    controls: defaultControls({ zoom: false }).extend([new ControlPortal()]),
  });

  map.addLayer(mapLayers.markerLayer.getLayer());
  const drawLayer = mapLayers.drawLayer.getLayer() as VectorLayer;
  map.addLayer(drawLayer);

  const intialView = getInitialMapView();

  map.setView(intialView);
  map.addControl(
    new ScaleLine({ minWidth: 160, bar: true, text: true, units: 'metric' }),
  );
  map.addControl(getMousePositionControl(intialView.getProjection().getCode()));
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
