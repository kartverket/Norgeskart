import { getDefaultStore } from 'jotai';
import VectorLayer from 'ol/layer/Vector';
import { mapAtom } from '../../../map/atoms';

export const getDrawLayer = (): VectorLayer => {
  const map = getDefaultStore().get(mapAtom);
  return map
    .getLayers()
    .getArray()
    .filter(
      (layer) => layer.get('id') === 'drawLayer',
    )[0] as unknown as VectorLayer;
};
