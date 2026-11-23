import {
  BackgroundLayerName,
  mapLegacyBackgroundLayerId,
} from './map/layers/backgroundLayers.ts';
import { mapLegacyThemeLayerId } from './map/layers/themeLayers.ts';
import {
  appendUrlParameter,
  getListUrlParameter,
  getUrlParameter,
  removeUrlParameter,
  setUrlParameter,
  transitionHashToQuery,
} from './shared/utils/urlUtils.ts';

const LEGACY_FLYFOTO_ID = '1002';
const LEGACY_TOPO_ID = '1001';

const hasExternalReferrer = (): boolean => {
  if (!document.referrer) {
    return false;
  }
  try {
    return new URL(document.referrer).hostname !== window.location.hostname;
  } catch {
    return false;
  }
};

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
      // Old links embedded/linked from other sites (e.g. the kartverket.no
      // eiendomskart iframe) hardcode Flyfoto (1002). When we know where the
      // user came from, show topo instead; bookmarks (no referrer) keep Flyfoto.
      layerNameFromUrl =
        backgroundLayerId === LEGACY_FLYFOTO_ID && hasExternalReferrer()
          ? LEGACY_TOPO_ID
          : backgroundLayerId;
    }

    legacyThemeLayerIds = themeLayerIds;
  }

  if (layerNameFromUrl) {
    const legacyLayerName = mapLegacyBackgroundLayerId(layerNameFromUrl);
    if (legacyLayerName) {
      if (legacyLayerName !== layerNameFromUrl && !legacyLayerParam) {
        // e.g. ?backgroundLayer=topo from links shared before the switch
        setUrlParameter('backgroundLayer', legacyLayerName);
      }
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

  // Handle legacy wms/addLayers/geojson/type parameters from old norgeskart.no
  const legacyWmsParam = getUrlParameter('wms');
  const legacyGeojsonParam = getUrlParameter('geojson');

  if (legacyWmsParam ?? legacyGeojsonParam) {
    if (legacyWmsParam) {
      const wmsUrls = legacyWmsParam
        .split(',')
        .map((u) => u.trim())
        .filter((u) => u.length > 0);

      // addLayers items were internal old-system identifiers, NOT WMS LAYERS params.
      // Let fetchRootLayerName resolve the correct layer name from GetCapabilities.
      wmsUrls.forEach((wmsUrl) => {
        appendUrlParameter('wmsUrl', wmsUrl);
      });
    }

    if (legacyGeojsonParam) {
      appendUrlParameter('geojsonUrl', legacyGeojsonParam);
    }

    removeUrlParameter('wms');
    removeUrlParameter('addLayers');
    removeUrlParameter('geojson');
    removeUrlParameter('type');
  }
};
