import { atom } from 'jotai';
import { View } from 'ol';
import ScaleLine from 'ol/control/ScaleLine.js';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify.js';
import Snap from 'ol/interaction/Snap.js';
import LayerGroup from 'ol/layer/Group';
import Map from 'ol/Map';
import { get as getProjection, Projection } from 'ol/proj';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { BackgroundLayer, mapLayers } from './layers';
import { getMousePositionControl } from './mapControls';

const INITIAL_PROJECTION: ProjectionIdentifier = 'EPSG:3857';

export type ProjectionIdentifier =
  | 'EPSG:3857' // webmercator
  | 'EPSG:25832' // utm32n
  | 'EPSG:25833' // utm33n
  | 'EPSG:25835'; // utm35n

export const projectionIdAtom = atom<ProjectionIdentifier>(INITIAL_PROJECTION);
export const projectionAtom = atom<Projection>(
  (get) => getProjection(get(projectionIdAtom))!,
);

export const baseLayerIdAtom = atom<string | null>(null);
export const backgroundLayerIdAtom = atom<string | null>(null);

export const backgroundLayerAtom = atom<BackgroundLayer>('newTopo');

export const mapAtom = atom<Map>(() => {
  const map = new Map();
  const projection = getProjection(INITIAL_PROJECTION)!;
  const projectionExtent = projection.getExtent();

  const intialView = new View({
    center: [1737122, 9591875],
    minZoom: 3,
    zoom: 5,
    projection: projection,
    extent: projectionExtent,
  });
  map.addLayer(mapLayers.europaForenklet.getLayer(INITIAL_PROJECTION));
  map.addLayer(
    new LayerGroup({
      layers: [
        mapLayers.backgroundLayers.newTopo.getLayer(INITIAL_PROJECTION),
        mapLayers.backgroundLayers.topo.getLayer(INITIAL_PROJECTION),
      ],
      properties: { id: 'backgroundLayers' },
    }),
  );
  map.addLayer(mapLayers.drawLayer.getLayer(INITIAL_PROJECTION));

  map.setView(intialView);
  map.addControl(new ScaleLine({ units: 'metric' }));
  map.addControl(getMousePositionControl(INITIAL_PROJECTION));

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

export const drawEnabledAtom = atom<boolean>((get) => {
  const draw = get(drawAtom);
  return draw !== null;
});
