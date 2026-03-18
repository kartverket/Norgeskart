import { Box } from '@kvib/react';
import { PostHogErrorBoundary } from '@posthog/react';
import { useEffect, useRef } from 'react';

import { Debug } from './debug/Debug.tsx';
import './i18n';
import { Layout } from './Layout.tsx';
import {
  BackgroundLayerName,
  mapLegacyBackgroundLayerId,
} from './map/layers/backgroundLayers.ts';
import { themeLayerConfig } from './map/layers/themeLayerConfigApi.ts';
import { mapLegacyThemeLayerId } from './map/layers/themeLayers.ts';
import { useMapSettings } from './map/mapHooks.ts';
import { RettIKartetDialog } from './map/menu/dialogs/RettIKartetDialog.tsx';
import { MapLegendDrawer } from './map/menu/drawers/MapLegendDrawer.tsx';
import { MessageBox } from './messages/MessageBox.tsx';
import {
  getListUrlParameter,
  getUrlParameter,
  removeUrlParameter,
  setUrlParameter,
  transitionHashToQuery,
} from './shared/utils/urlUtils.ts';

export const App = () => {
  const { setMapFullScreen } = useMapSettings();
  const hasProcessedUrlRef = useRef(false);

  const fullscreenClickHandler = (event: KeyboardEvent) => {
    if (event.key === 'F11') {
      event.preventDefault();
      setMapFullScreen(true);
      event.stopPropagation();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', fullscreenClickHandler);
    return () => {
      document.removeEventListener('keydown', fullscreenClickHandler);
    };
  });

  useEffect(() => {
    if (hasProcessedUrlRef.current) {
      return;
    }

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

    if (legacyLayerParam) {
      removeUrlParameter('layers');
      removeUrlParameter('project');
      setUrlParameter('backgroundLayer', finalLayerName);

      const currentThemeLayers = getListUrlParameter('themeLayers') || [];
      const newThemeLayers = [...currentThemeLayers];

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
  }, []);

  return (
    <PostHogErrorBoundary fallback={ErrorFallback}>
      <MessageBox />
      <RettIKartetDialog />
      <MapLegendDrawer />
      <Debug />
      <Layout />
    </PostHogErrorBoundary>
  );
};

export default App;

const ErrorFallback = () => {
  return (
    <Box>Noe gikk veldig galt med Norgeskart. Prøv å laste siden på nytt.</Box>
  );
};
