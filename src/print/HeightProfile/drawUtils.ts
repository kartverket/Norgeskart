import { getDefaultStore } from 'jotai';
import Draw from 'ol/interaction/Draw';
import VectorLayer from 'ol/layer/Vector';
import { Vector } from 'ol/source';
import { mapAtom } from '../../map/atoms';

const LAYER_ID = 'heightProfileDrawLayer';

export const addDrawInteractionToMap = () => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);

  const drawLayer = new VectorLayer({
    source: new Vector(),
    zIndex: 1000,
    properties: { id: LAYER_ID },
  });

  map.addLayer(drawLayer);
  const drawInteraction = new Draw({
    source: drawLayer.getSource()!,
    type: 'LineString',
  });

  drawInteraction.on('drawstart', () => {
    drawLayer.getSource()?.clear();
  });
  map.addInteraction(drawInteraction);
};

export const removeDrawInteractionFromMap = () => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);

  const drawLayer = map
    .getLayers()
    .getArray()
    .find((layer) => layer.get('id') === LAYER_ID) as VectorLayer | undefined;

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
