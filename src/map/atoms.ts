import { atom } from 'jotai';
import { View } from 'ol';
import { defaults as defaultControls } from 'ol/control/defaults.js';
import ScaleLine from 'ol/control/ScaleLine.js';
import Draw from 'ol/interaction/Draw';
import Link from 'ol/interaction/Link.js';
import Modify from 'ol/interaction/Modify.js';
import Select from 'ol/interaction/Select.js';
import Snap from 'ol/interaction/Snap.js';
import Translate from 'ol/interaction/Translate';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import { get as getProjection } from 'ol/proj';
import { Fill, Icon, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { validateProjectionIdString } from '../shared/utils/enumUtils';
import { getUrlParameter } from '../shared/utils/urlUtils';
import { BackgroundLayer, mapLayers } from './layers';
import { ControlPortal, getMousePositionControl } from './mapControls';
import { getBackgroundLayerId } from './mapHooks';

const INITIAL_PROJECTION: ProjectionIdentifier = 'EPSG:3857';

export type ProjectionIdentifier =
  | 'EPSG:3857' // webmercator
  | 'EPSG:25832' // utm32n
  | 'EPSG:25833' // utm33n
  | 'EPSG:25835'; // utm35n

export const baseLayerIdAtom = atom<string | null>(null);
export const backgroundLayerIdAtom = atom<string | null>(null);
export const mapOrientationAtom = atom<number>(0);
export const mapOrientationDegreesAtom = atom<number>((get) => {
  const radians = get(mapOrientationAtom);
  return (radians * 180) / Math.PI; // Convert radians to degrees
});
export const displayCompassOverlayAtom = atom<boolean>(false);
export const useMagneticNorthAtom = atom<boolean>(false);
export const magneticDeclinationAtom = atom<number>(0);

export const backgroundLayerAtom = atom<BackgroundLayer>('topo');

export const mapAtom = atom<Map>(() => {
  const map = new Map({
    controls: defaultControls().extend([new ControlPortal()]),
  });

  const projectionIdFromUrl = validateProjectionIdString(
    getUrlParameter('projection'),
  );
  const projectionId = projectionIdFromUrl
    ? projectionIdFromUrl
    : INITIAL_PROJECTION;

  const projection = getProjection(projectionId)!;
  const projectionExtent = projection.getExtent();

  map.addLayer(mapLayers.europaForenklet.getLayer(projectionId));

  map.addLayer(
    mapLayers.backgroundLayers[getBackgroundLayerId()].getLayer(projectionId),
  );
  map.addLayer(mapLayers.drawLayer.getLayer(projectionId));
  map.addLayer(mapLayers.markerLayer.getLayer(projectionId));
  const drawLayer = mapLayers.drawLayer.getLayer(projectionId) as VectorLayer;
  map.addLayer(drawLayer);

  const intialView = new View({
    center: [1737122, 9591875],
    minZoom: 3,
    maxZoom: 20,
    zoom: 5,
    projection: projection,
    extent: projectionExtent,
  });
  map.setView(intialView);
  map.addControl(new ScaleLine({ units: 'metric' }));
  map.addControl(getMousePositionControl(projectionId));
  const link = new Link({
    params: ['x', 'y', 'z'],
  });

  map.addInteraction(link);

  return map;
});

export const drawAtom = atom<Draw | null>(null);
export const drawStyleAtom = atom<Style>(
  new Style({
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: '#ffffff',
      }),
      stroke: new Stroke({
        color: '#ffffff',
        width: 2,
      }),
    }),
    stroke: new Stroke({
      color: '#ffffff',
      width: 2,
    }),
    fill: new Fill({
      color: '#ffffff',
    }),
  }),
);

export const drawFillColorAtom = atom<string>(
  (get) => get(drawStyleAtom).getFill()?.getColor()?.toString() || '#ffffff',
);
export const drawStrokeColorAtom = atom<string>(
  (get) => get(drawStyleAtom).getStroke()?.getColor()?.toString() || '#ffffff',
);
export const snapAtom = atom<Snap | null>(null);
export const modifyAtom = atom<Modify | null>(null);
export const selectAtom = atom<Select | null>(null);
export const translateAtom = atom<Translate | null>(null);

export const drawEnabledAtom = atom<boolean>(false);

export const markerStyleAtom = atom<Style>(
  new Style({
    image: new Icon({
      src: '/location.svg',
      anchor: [0.5, 1],
      scale: 1.5,
    }),
  }),
);
