import { atom } from 'jotai';
import { loadable } from 'jotai/utils';

export interface FieldConfig {
  name: string;
  alias?: string;
  type?: 'symbol' | 'link' | 'picture';
  baseurl?: string;
  filetype?: string;
  unit?: string;
}

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
  infoFormat?: string;
  featureInfoImageBaseUrl?: string;
  featureInfoFields?: FieldConfig[];
}

export interface ThemeLayerStyle {
  fill?: {
    color: string;
  };
  stroke?: {
    color: string;
    width: number;
  };
  text?: {
    property: string;
    scale?: number;
    fill?: { color: string };
    stroke?: { color: string; width: number };
  };
}

export interface ThemeLayerDefinition {
  id: string;
  name: {
    nb: string;
    nn: string;
    en: string;
  };
  type?: 'wms' | 'geojson';
  wmsUrl?: string;
  geojsonUrl?: string;
  sourceEpsg?: string;
  style?: ThemeLayerStyle;
  legendUrl?: string;
  layers?: string;
  categoryId: string;
  groupid: number;
  legacyId?: string;
  queryable?: boolean;
  styles?: string;
  infoFormat?: string;
  featureInfoImageBaseUrl?: string;
  featureInfoFields?: FieldConfig[];
}

export interface ThemeLayerConfig {
  categories: ThemeLayerCategory[];
  layers: ThemeLayerDefinition[];
}

const CATEGORY_FILES = [
  'outdoorRecreation',
  //'placeNames',
  'facts',
  'tilgjengelighet',
  'fastmerker',
  //'nrl',
  'dekning',
];

const themeLayerConfigAtom = atom<Promise<ThemeLayerConfig>>(async () => {
  const configPromises = CATEGORY_FILES.map(async (categoryName) => {
    const response = await fetch(`/config/categories/${categoryName}.json`);
    if (!response.ok) {
      throw new Error(
        `Failed to load category config ${categoryName}: ${response.statusText}`,
      );
    }
    return response.json() as Promise<ThemeLayerConfig>;
  });

  const configs = await Promise.all(configPromises);

  const mergedConfig: ThemeLayerConfig = {
    categories: [],
    layers: [],
  };

  for (const config of configs) {
    mergedConfig.categories.push(...config.categories);
    mergedConfig.layers.push(...config.layers);
  }

  return mergedConfig;
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
