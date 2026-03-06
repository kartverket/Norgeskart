import { getDefaultStore } from 'jotai';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import VectorLayer from 'ol/layer/Vector';
import { Vector } from 'ol/source';
import { Stroke, Style } from 'ol/style';
import { mapAtom } from '../../map/atoms';
import { profileLineAtom } from './atoms';

const ELEVATION_LAYER_ID = 'elevationProfileDrawLayer';

export const addFeatureToLayer = (geometry: Feature) => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const drawLayer = map
    .getLayers()
    .getArray()
    .find((layer) => layer.get('id') === ELEVATION_LAYER_ID) as
    | VectorLayer
    | undefined;
  if (drawLayer) {
    drawLayer.getSource()?.addFeature(geometry);
  }
};

export const clearDrawLayer = () => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const drawLayer = map
    .getLayers()
    .getArray()
    .find((layer) => layer.get('id') === ELEVATION_LAYER_ID) as
    | VectorLayer
    | undefined;
  if (drawLayer) {
    drawLayer.getSource()?.clear();
  }
};

export const addDrawInteractionToMap = (onDrawEnd: () => void) => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);

  const drawLayer = new VectorLayer({
    source: new Vector(),
    zIndex: 1000,
    properties: { id: ELEVATION_LAYER_ID },
  });

  map.addLayer(drawLayer);
  const drawInteraction = new Draw({
    source: drawLayer.getSource()!,
    type: 'LineString',
  });

  drawLayer.setStyle(
    new Style({
      stroke: new Stroke({
        color: '#ff0000',
        width: 4,
      }),
    }),
  );

  drawInteraction.on('drawstart', () => {
    drawLayer.getSource()?.clear();
  });

  const onNewFeature = (feature: Feature) => {
    const geometry = feature.getGeometry();
    if (!geometry) return;
    if (!(geometry instanceof LineString)) return;
    onDrawEnd();
    store.set(profileLineAtom, geometry);
  };

  drawInteraction.on('drawend', (e: DrawEvent) => {
    const feature = e.feature;
    onNewFeature(feature);
  });
  map.addInteraction(drawInteraction);

  drawLayer.getSource()?.on('addfeature', (e) => {
    const feature = e.feature;
    if (!feature) return;
    onNewFeature(feature);
  });
};

export const removeDrawInteractionFromMap = () => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);

  const drawLayer = map
    .getLayers()
    .getArray()
    .find((layer) => layer.get('id') === ELEVATION_LAYER_ID) as
    | VectorLayer
    | undefined;

  if (drawLayer) {
    map.removeLayer(drawLayer);
  }

  const drawInteraction = map
    .getInteractions()
    .getArray()
    .find((interaction) => interaction instanceof Draw) as Draw | undefined;

  if (drawInteraction) {
    map.removeInteraction(drawInteraction);
  }
};

export const disableDrawInteraction = () => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const drawInteraction = map
    .getInteractions()
    .getArray()
    .find((interaction) => interaction instanceof Draw) as Draw | undefined;
  drawInteraction?.setActive(false);
};

export const enableDrawInteraction = () => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const drawInteraction = map
    .getInteractions()
    .getArray()
    .find((interaction) => interaction instanceof Draw) as Draw | undefined;
  drawInteraction?.setActive(true);
};
