import { useAtom, useAtomValue } from 'jotai';
import { themeLayerConfigAtom } from '../../api/themeLayerConfigApi';
import { activeThemeLayersAtom } from './atoms';
import { ThemeLayerName } from './themeWMS';

export const MAX_THEME_LAYERS = 10; // Maximum number of theme layers allowed on the map, what is a good number here?

export const mapLegacyThemeLayerId = (
  legacyId: string,
  configLoadable?: ReturnType<typeof useAtomValue<typeof themeLayerConfigAtom>>,
  projectName?: string,
): string | undefined => {
  if (!configLoadable) {
    return undefined;
  }
  const normalizedProject = projectName?.toLowerCase();

  const layer = configLoadable.layers.find((l) => {
    if (l.legacyId !== legacyId) return false;

    if (!normalizedProject) return true;

    const category = configLoadable.categories.find(
      (cat) => cat.id === l.categoryId,
    );

    return (
      category?.id === normalizedProject ||
      category?.parentId === normalizedProject
    );
  });

  if (layer) {
    return layer.id;
  }

  const legacyMap: Record<string, string> = {
    // Property/Cadastre
    adresses: 'adresses',
    buildings: 'buildings',
    parcels: 'parcels',
    // Historical maps
    economicMapFirstEdition: 'economicMapFirstEdition',
    amtMap: 'amtMap',
  };

  return legacyMap[legacyId];
};

export const parseLegacyLayersParameter = (
  layersParam: string,
): { backgroundLayerId: string; themeLayerIds: string[] } => {
  const parts = layersParam.split(',').map((s) => s.trim());
  const backgroundLayerId = parts[0];
  const themeLayerIds = parts.slice(1);

  return {
    backgroundLayerId,
    themeLayerIds,
  };
};

export const useThemeLayers = () => {
  const [activeLayerSet, setActiveLayerSet] = useAtom(activeThemeLayersAtom);

  const addThemeLayerToMap = (layerName: ThemeLayerName): boolean => {
    if (activeLayerSet.size >= MAX_THEME_LAYERS) {
      return false;
    }
    setActiveLayerSet((prev) => new Set(prev).add(layerName));
    return true;
  };

  const removeThemeLayerFromMap = (layerName: ThemeLayerName) => {
    setActiveLayerSet((prev) => {
      const newSet = new Set(prev);
      newSet.delete(layerName);
      return newSet;
    });
  };

  return {
    activeLayerSet,
    addThemeLayerToMap,
    removeThemeLayerFromMap,
  };
};
