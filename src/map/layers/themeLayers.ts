import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { mapAtom } from '../atoms';
import { themeLayersAtom, themLayersAtomEffect } from './atoms';
import { getThemeWMSLayer, ThemeLayerName } from './themeWMS';

export const useThemeLayers = () => {
  const map = useAtomValue(mapAtom);
  const mapProjection = map.getView().getProjection().getCode();
  const setThemeLayers = useSetAtom(themeLayersAtom);
  useAtom(themLayersAtomEffect);

  const addThemeLayerToMap = (layerName: ThemeLayerName) => {
    const layerExists = map
      .getLayers()
      .getArray()
      .some((layer) => layer.get('id') === `theme.${layerName}`);
    if (layerExists) {
      console.warn('Layer already exists on map');
      return;
    }
    const layerToAdd = getThemeWMSLayer(layerName, mapProjection);
    if (!layerToAdd) {
      console.warn(
        `Could not create theme layer: ${layerName} for projection: ${mapProjection}`,
      );
      return;
    }
    layerToAdd.setZIndex(10);
    map.addLayer(layerToAdd);
    setThemeLayers((prev) => [...new Set([...prev, layerName])]);
  };

  const removeThemeLayerFromMap = (layerName: ThemeLayerName) => {
    const layer = map
      .getLayers()
      .getArray()
      .find((layer) => layer.get('id') === `theme.${layerName}`);
    if (layer) {
      map.removeLayer(layer);
    }
    setThemeLayers((prev) => prev.filter((name) => name !== layerName));
  };

  return {
    addThemeLayerToMap,
    removeThemeLayerFromMap,
  };
};
