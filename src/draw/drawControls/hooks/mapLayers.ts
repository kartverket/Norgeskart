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

export const getMarkerLayer = (): VectorLayer => {
  const map = getDefaultStore().get(mapAtom);
  return map
    .getLayers()
    .getArray()
    .filter(
      (layer) => layer.get('id') === 'markerLayer',
    )[0] as unknown as VectorLayer;
};

export const getPosterMarkerLayer = (): VectorLayer => {
  const map = getDefaultStore().get(mapAtom);
  return map
    .getLayers()
    .getArray()
    .filter(
      (layer) => layer.get('id') === 'posterMarkerLayer',
    )[0] as unknown as VectorLayer;
};

export const getPropertyGeometryLayer = (): VectorLayer | null => {
  const map = getDefaultStore().get(mapAtom);
  const layersMatching = map
    .getLayers()
    .getArray()
    .filter((layer) => layer.get('id') === 'propertyGeometryLayer');
  if (layersMatching.length === 0) {
    return null;
  }
  return layersMatching[0] as unknown as VectorLayer;
};

export const getDrawOverlayLayer = (): VectorLayer => {
  const map = getDefaultStore().get(mapAtom);
  return map
    .getLayers()
    .getArray()
    .filter(
      (layer) => layer.get('id') === 'drawOverlayLayer',
    )[0] as unknown as VectorLayer;
};