import { useAtomValue } from 'jotai';
import {
  addToUrlListParameter,
  removeFromUrlListParameter,
} from '../../shared/utils/urlUtils';
import { mapAtom } from '../atoms';
import { getThemeWMSLayer, ThemeLayerName } from './themeWMS';

export const useThemeLayers = () => {
  const map = useAtomValue(mapAtom);
  const mapProjection = map.getView().getProjection().getCode();

  const addThemeLayersToMap = (layerName: ThemeLayerName) => {
    const layerExists = map
      .getLayers()
      .getArray()
      .some((layer) => layer.get('id') === `theme.${layerName}`);
    if (layerExists) {
      console.log('Layer already exists on map');
      return;
    }
    const layerToAdd = getThemeWMSLayer(layerName, mapProjection);
    if (!layerToAdd) {
      console.warn(
        `Could not create theme layer: ${layerName} for projection: ${mapProjection}`,
      );
      return;
    }
    map.addLayer(layerToAdd);
    addToUrlListParameter('themeLayers', layerName);
  };

  const removeThemeLayerFromMap = (layerName: ThemeLayerName) => {
    const layer = map
      .getLayers()
      .getArray()
      .find((layer) => layer.get('id') === `theme.${layerName}`);
    if (layer) {
      map.removeLayer(layer);
    }
    removeFromUrlListParameter('themeLayers', layerName);
  };

  return {
    addThemeLayersToMap,
    removeThemeLayerFromMap,
  };
};
