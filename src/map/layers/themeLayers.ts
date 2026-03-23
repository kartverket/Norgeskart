import { useAtom } from 'jotai';
import { activeThemeLayersAtom } from './atoms';
import { themeLayerConfig } from './themeLayerConfigApi';
import { ThemeLayerName } from './themeWMS';

export const WARNING_THRESHOLD = 15;

export const mapLegacyThemeLayerId = (
  legacyId: string,
  projectName?: string,
): string | undefined => {
  const layer = themeLayerConfig.layers.find(
    (l) => l.legacyId === `${projectName ? projectName + '.' : ''}${legacyId}`,
  );

  if (layer) {
    return layer.id;
  }
};

export const useThemeLayers = () => {
  const [activeLayerSet, setActiveLayerSet] = useAtom(activeThemeLayersAtom);

  const addThemeLayersToMap = (layerNames: ThemeLayerName[]) => {
    setActiveLayerSet((prev) => {
      const newSet = new Set(prev);
      layerNames.forEach((name) => {
        newSet.add(name);
      });
      return newSet;
    });
  };

  const addThemeLayerToMap = (
    layerName: ThemeLayerName | ThemeLayerName[],
  ): boolean => {
    if (Array.isArray(layerName)) {
      addThemeLayersToMap(layerName);
    } else {
      setActiveLayerSet((prev) => new Set(prev).add(layerName));
    }
    return true;
  };
  const removeThemeLayersFromMap = (layerNames: ThemeLayerName[]) => {
    setActiveLayerSet((prev) => {
      const newSet = new Set(prev);
      layerNames.forEach((name) => {
        newSet.delete(name);
      });
      return newSet;
    });
  };

  const removeThemeLayerFromMap = (
    layerName: ThemeLayerName | ThemeLayerName[],
  ) => {
    if (Array.isArray(layerName)) {
      removeThemeLayersFromMap(layerName);
    } else {
      setActiveLayerSet((prev) => {
        const newSet = new Set(prev);
        newSet.delete(layerName);
        return newSet;
      });
    }
  };

  return {
    activeLayerSet,
    addThemeLayerToMap,
    removeThemeLayerFromMap,
  };
};
