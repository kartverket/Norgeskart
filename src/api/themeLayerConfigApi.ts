import { atom } from 'jotai';
import { loadable } from 'jotai/utils';

export interface ThemeLayerCategory {
  id: string;
  groupid: number;
  name: {
    nb: string;
    nn: string;
    en: string;
  };
  wmsUrl?: string;
  parentId?: string;
}

export interface ThemeLayerDefinition {
  id: string;
  name: {
    nb: string;
    nn: string;
    en: string;
  };
  wmsUrl?: string;
  legendUrl?: string;
  layers: string;
  categoryId: string;
  groupid: number;
  legacyId?: string;
  queryable?: boolean;
  styles?: string;
}

export interface ThemeLayerConfig {
  categories: ThemeLayerCategory[];
  layers: ThemeLayerDefinition[];
}

const themeLayerConfigAtom = atom<Promise<ThemeLayerConfig>>(async () => {
  const response = await fetch('/config/themeLayers.json');
  if (!response.ok) {
    throw new Error(
      `Failed to load theme layer config: ${response.statusText}`,
    );
  }
  const config: ThemeLayerConfig = await response.json();
  return config;
});

export const themeLayerConfigLoadableAtom = loadable(themeLayerConfigAtom);

export const getThemeLayerById = (
  config: ThemeLayerConfig,
  id: string,
): ThemeLayerDefinition | undefined => {
  return config.layers.find((layer) => layer.id === id);
};

export const getThemeLayerByLegacyId = (
  config: ThemeLayerConfig,
  legacyId: string,
): ThemeLayerDefinition | undefined => {
  return config.layers.find((layer) => layer.legacyId === legacyId);
};

export const getThemeLayersByCategory = (
  config: ThemeLayerConfig,
  categoryId: string,
): ThemeLayerDefinition[] => {
  return config.layers.filter((layer) => layer.categoryId === categoryId);
};

export const getThemeLayersByGroupId = (
  config: ThemeLayerConfig,
  groupid: number,
): ThemeLayerDefinition[] => {
  return config.layers.filter((layer) => layer.groupid === groupid);
};

export const getCategoryById = (
  config: ThemeLayerConfig,
  categoryId: string,
): ThemeLayerCategory | undefined => {
  return config.categories.find((cat) => cat.id === categoryId);
};

export const getEffectiveWmsUrl = (
  config: ThemeLayerConfig,
  layer: ThemeLayerDefinition,
): string => {
  if (layer.wmsUrl) {
    return layer.wmsUrl;
  }
  const category = getCategoryById(config, layer.categoryId);
  if (category?.wmsUrl) {
    return category.wmsUrl;
  }
  throw new Error(
    `No wmsUrl found for layer ${layer.id} in category ${layer.categoryId}`,
  );
};

export const getMainCategories = (
  config: ThemeLayerConfig,
): ThemeLayerCategory[] => {
  return config.categories.filter((cat) => !cat.parentId);
};

export const getSubcategories = (
  config: ThemeLayerConfig,
  parentId: string,
): ThemeLayerCategory[] => {
  return config.categories.filter((cat) => cat.parentId === parentId);
};

export const getParentCategory = (
  config: ThemeLayerConfig,
  category: ThemeLayerCategory,
): ThemeLayerCategory | undefined => {
  if (!category.parentId) {
    return undefined;
  }
  return getCategoryById(config, category.parentId);
};

export const isMainCategory = (category: ThemeLayerCategory): boolean => {
  return !category.parentId;
};

export const hasSubcategories = (
  config: ThemeLayerConfig,
  categoryId: string,
): boolean => {
  return config.categories.some((cat) => cat.parentId === categoryId);
};
