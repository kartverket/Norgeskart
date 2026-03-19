import {
  BackgroundLayerName,
  mapLegacyBackgroundLayerId,
} from './map/layers/backgroundLayers.ts';
import { mapLegacyThemeLayerId } from './map/layers/themeLayers.ts';
import {
  getListUrlParameter,
  getUrlParameter,
  removeUrlParameter,
  setUrlParameter,
  transitionHashToQuery,
} from './shared/utils/urlUtils.ts';

export const processUrlParameters = () => {
  transitionHashToQuery();

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

  removeUrlParameter('project');
  if (legacyLayerParam) {
    removeUrlParameter('layers');
    setUrlParameter('backgroundLayer', finalLayerName);

    const currentThemeLayers = getListUrlParameter('themeLayers') || [];
    newThemeLayers.push(...currentThemeLayers);

    legacyThemeLayerIds.forEach((legacyId) => {
      const modernId = mapLegacyThemeLayerId(legacyId, projectParam);
      if (modernId && !newThemeLayers.includes(modernId)) {
        newThemeLayers.push(modernId);
      }
    });

    if (newThemeLayers.length > currentThemeLayers.length) {
      setUrlParameter('themeLayers', newThemeLayers.join(','));
    }
  }
};
