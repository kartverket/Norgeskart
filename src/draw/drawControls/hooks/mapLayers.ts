import { useAtomValue } from 'jotai';
import VectorLayer from 'ol/layer/Vector';
import { mapAtom } from '../../../map/atoms';

export const useMapLayers = () => {
  const map = useAtomValue(mapAtom);
  const getDrawLayer = () => {
    return map
      .getLayers()
      .getArray()
      .filter(
        (layer) => layer.get('id') === 'drawLayer',
      )[0] as unknown as VectorLayer;
  };

  const getPropertyGeometryLayer = () => {
    return map
      .getLayers()
      .getArray()
      .filter(
        (layer) => layer.get('id') === 'propertyGeometryLayer',
      )[0] as unknown as VectorLayer;
  };

  return { getDrawLayer, getPropertyGeometryLayer };
};
