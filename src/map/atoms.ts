import { atom } from 'jotai';
import { View } from 'ol';
import MousePosition from 'ol/control/MousePosition.js';
import ScaleLine from 'ol/control/ScaleLine.js';
import { createStringXY } from 'ol/coordinate.js';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import { get as getProjection, Projection } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { BackgroundLayer, mapLayers } from './layers';

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
    center: [570130, 7032300],
    minZoom: 3,
    zoom: 3,
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
  map.addControl(new MousePosition({ coordinateFormat: createStringXY(2) }));

  return map;
});
