import { borderConfig } from './config/themeLayers/borders';
import { dekningConfig } from './config/themeLayers/dekning';
import { fastmerkerLayerConfig } from './config/themeLayers/fastmerker';
import { historicalMapsConfig } from './config/themeLayers/historicalMaps';
import { outdoorRecreationLayerConfig } from './config/themeLayers/outdoorRecreation';
import { placeNamesConfig } from './config/themeLayers/placeNames';
import { propertyInfoConfig } from './config/themeLayers/propertyInfo';
import { sjoConfig } from './config/themeLayers/sjo';
import { tilgjengelighetConfig } from './config/themeLayers/tilgjengelighet';
import { topoMapserverConfig } from './config/themeLayers/topoMapserver';
import { topoQgisConfig } from './config/themeLayers/topoQgis';
import { ThemeLayerName } from './themeWMS';

export interface FieldConfig {
  name: string;
  alias?: string;
  type?: 'symbol' | 'link' | 'picture';
  baseurl?: string;
  filetype?: string;
  unit?: string;
  decimals?: number;
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
  useLegendGraphic?: boolean;
  legendLayerNames?: string[];
  filter?: string;
  noLegend?: boolean;
  singleImage?: boolean;
  notReady?: boolean;
}

export interface ThemeLayerConfig {
  categories: ThemeLayerCategory[];
  layers: ThemeLayerDefinition[];
}

const getThemeLayerConfig = () => {
  const mergedConfig: ThemeLayerConfig = {
    categories: [],
    layers: [],
  };
  const configs: ThemeLayerConfig[] = [
    propertyInfoConfig,
    outdoorRecreationLayerConfig,
    sjoConfig,
    borderConfig,
    historicalMapsConfig,
    tilgjengelighetConfig,
    placeNamesConfig,
    fastmerkerLayerConfig,
    dekningConfig,
    topoMapserverConfig,
    topoQgisConfig,
  ];

  for (const config of configs) {
    mergedConfig.categories.push(...config.categories);
    mergedConfig.layers.push(...config.layers);
  }

  return mergedConfig;
};
export const themeLayerConfig = getThemeLayerConfig();

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

export const getEffectiveLegendUrl = (
  config: ThemeLayerConfig,
  id: ThemeLayerName,
): string | undefined => {
  const layer = getThemeLayerById(config, id);

  if (!layer) {
    return undefined;
  }
  if (layer.legendUrl) {
    return layer.legendUrl;
  }
  if (layer.type !== 'geojson') {
    const wmsUrl = getEffectiveWmsUrl(config, layer);
    return (
      wmsUrl +
      '?SERVICE=wms&REQUEST=GetStyles&VERSION=1.3.0&FORMAT=application/json&Layers=' +
      layer.layers
    );
  }
  return undefined;
};

export const getEffectiveLegendImageUrl = (
  config: ThemeLayerConfig,
  id: ThemeLayerName,
) => {
  const layer = getThemeLayerById(config, id);
  if (!layer) {
    return undefined;
  }
  if (layer.useLegendGraphic) {
    const wmsUrl = getEffectiveWmsUrl(config, layer);
    return (
      wmsUrl +
      '?SERVICE=WMS&REQUEST=GetLegendGraphic&VERSION=1.3.0&SLD_VERSION=1.1.0&FORMAT=image/png&LAYER=' +
      layer.layers
    );
  }
  return undefined;
};

export const getMainCategories = (
  config: ThemeLayerConfig,
): ThemeLayerCategory[] => {
  return config.categories.filter(isMainCategory);
};

export const getSubcategories = (
  config: ThemeLayerConfig,
  parentId: string,
): ThemeLayerCategory[] => {
  return config.categories.filter(
    (cat) => cat.parentId === parentId && !isMainCategory(cat),
  );
};

export const getDirectLayersForCategory = (
  config: ThemeLayerConfig,
  categoryId: string,
): ThemeLayerDefinition[] => {
  return config.layers.filter((layer) => layer.categoryId === categoryId);
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
