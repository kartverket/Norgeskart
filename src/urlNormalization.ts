import {
  BackgroundLayerName,
  mapLegacyBackgroundLayerId,
} from './map/layers/backgroundLayers.ts';
import { borderConfig } from './map/layers/config/backgroundLayers/borders.ts';
import { dekningConfig } from './map/layers/config/backgroundLayers/dekning.ts';
import { fastmerkerLayerConfig } from './map/layers/config/backgroundLayers/fastmerker.ts';
import { historicalMapsConfig } from './map/layers/config/backgroundLayers/historicalMaps.ts';
import { outdoorRecreationLayerConfig } from './map/layers/config/backgroundLayers/outdoorRecreation.ts';
import { placeNamesConfig } from './map/layers/config/backgroundLayers/placeNames.ts';
import { propertyInfoConfig } from './map/layers/config/backgroundLayers/propertyInfo.ts';
import { sjoConfig } from './map/layers/config/backgroundLayers/sjo.ts';
import { tilgjengelighetConfig } from './map/layers/config/backgroundLayers/tilgjengelighet.ts';
import { ThemeLayerConfig } from './map/layers/themeLayerConfigApi.ts';
import { mapLegacyThemeLayerId } from './map/layers/themeLayers.ts';
import {
  getListUrlParameter,
  getUrlParameter,
  removeUrlParameter,
  setUrlParameter,
  transitionHashToQuery,
} from './shared/utils/urlUtils.ts';

const getThemeLayers = () => {
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
  ];

  for (const config of configs) {
    mergedConfig.categories.push(...config.categories);
    mergedConfig.layers.push(...config.layers);
  }

  return mergedConfig;
};

export const processUrlParameters = () => {
  transitionHashToQuery();
  const themeLayerConfig = getThemeLayers();

  let layerNameFromUrl = getUrlParameter('backgroundLayer');
  const legacyLayerParam = getUrlParameter('layers');
  const projectParam = getUrlParameter('project') ?? undefined;
  let legacyThemeLayerIds: string[] = [];

  if (legacyLayerParam) {
    const layerIds = legacyLayerParam
      .split(',')
      .map((s) => s.trim())
      .filter((id) => id.length > 0);

    const backgroundLayerId = layerIds.find(
      (id) => mapLegacyBackgroundLayerId(id) !== null,
    );

    const themeLayerIds = layerIds.filter(
      (id) => id !== backgroundLayerId && parseInt(id, 10) > 1010,
    );

    if (backgroundLayerId) {
      layerNameFromUrl = backgroundLayerId;
    }

    legacyThemeLayerIds = themeLayerIds;
  }

  if (layerNameFromUrl) {
    const legacyLayerName = mapLegacyBackgroundLayerId(layerNameFromUrl);
    if (legacyLayerName) {
      layerNameFromUrl = legacyLayerName;
    }
  }

  const finalLayerName = (layerNameFromUrl || 'topo') as BackgroundLayerName;
  const newThemeLayers: string[] = [];

  if (legacyLayerParam) {
    removeUrlParameter('layers');
    removeUrlParameter('project');
    setUrlParameter('backgroundLayer', finalLayerName);

    const currentThemeLayers = getListUrlParameter('themeLayers') || [];
    newThemeLayers.push(...currentThemeLayers);

    legacyThemeLayerIds.forEach((legacyId) => {
      const modernId = mapLegacyThemeLayerId(
        legacyId,
        themeLayerConfig,
        projectParam,
      );
      if (modernId && !newThemeLayers.includes(modernId)) {
        newThemeLayers.push(modernId);
      }
    });

    if (newThemeLayers.length > currentThemeLayers.length) {
      setUrlParameter('themeLayers', newThemeLayers.join(','));
    }
  }
};
