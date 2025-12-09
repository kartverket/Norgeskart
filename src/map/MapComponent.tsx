import { Box, Text } from '@kvib/react';
import { useAtomValue, useSetAtom } from 'jotai';
import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getFeatures } from '../api/nkApiClient.ts';
import { themeLayerConfigLoadableAtom } from '../api/themeLayerConfigApi.ts';
import { useDrawSettings } from '../draw/drawControls/hooks/drawSettings.ts';
import { ErrorBoundary } from '../shared/ErrorBoundary.tsx';
import {
  getListUrlParameter,
  getUrlParameter,
  removeUrlParameter,
  setUrlParameter,
  transitionHashToQuery,
} from '../shared/utils/urlUtils.ts';
import { mapAtom, scaleAtom, useMapEffects } from './atoms.ts';
import {
  BackgroundLayerName,
  mapLegacyBackgroundLayerId,
  useBackgoundLayers,
} from './layers/backgroundLayers.ts';
import { DEFAULT_BACKGROUND_LAYER } from './layers/backgroundWMTSProviders.ts';
import { mapLegacyThemeLayerId, useThemeLayers } from './layers/themeLayers.ts';
import { ThemeLayerName } from './layers/themeWMS.ts';
import { useMap, useMapSettings } from './mapHooks.ts';
import { getScaleFromResolution } from './mapScale.ts';
import {
  mapContextIsOpenAtom,
  mapContextXPosAtom,
  mapContextYPosAtom,
} from './menu/atoms.ts';
import { MapContextMenu } from './menu/MapContextMenu.tsx';

export const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { setBackgroundLayer } = useMapSettings();
  const { addThemeLayerToMap } = useThemeLayers();
  const { backgroundLayerState } = useBackgoundLayers();
  const map = useAtomValue(mapAtom);
  const configLoadable = useAtomValue(themeLayerConfigLoadableAtom);
  const { t } = useTranslation();
  const { setDrawLayerFeatures } = useDrawSettings();
  const setIsMenuOpen = useSetAtom(mapContextIsOpenAtom);
  const setXPos = useSetAtom(mapContextXPosAtom);
  const setYPos = useSetAtom(mapContextYPosAtom);
  const hasProcessedUrlRef = useRef(false);
  const hasLoadedThemeLayersRef = useRef(false);
  const hasLoadedDrawingRef = useRef(false);
  const setScale = useSetAtom(scaleAtom);
  useMapEffects();

  const { setTargetElement } = useMap();

  useEffect(() => {
    if (mapRef.current) {
      setTargetElement(mapRef.current);
    }
    return () => {
      setTargetElement(null);
    };
  }, [setTargetElement, mapRef]);

  /**
   * Process legacy URL parameters from old norgeskart.no format.
   *
   * Legacy format: #!?project=<category>&layers=<id1>,<id2>
   * Modern format: ?backgroundLayer=<name>&themeLayers=<id1>,<id2>
   *
   * Timing is critical:
   * 1. Hash transition must happen BEFORE processing (enables proper URL operations)
   * 2. Config must be loaded (needed for legacy ID mapping)
   * 3. Background layers must be available (needed for layer activation)
   * 4. Process only once per session (prevents re-running on URL updates)
   *
   * The legacy 'layers' param contains both background (1001-1010) and theme (>1010) IDs.
   * The 'project' param filters which theme layers are valid for the current category.
   */
  useEffect(() => {
    if (!map) {
      return;
    }

    if (configLoadable.state === 'hasError') {
      hasProcessedUrlRef.current = true;
      return;
    }

    if (configLoadable.state === 'loading') {
      return;
    }

    if (backgroundLayerState !== 'hasData') {
      return;
    }

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

    const finalLayerName = (layerNameFromUrl ||
      DEFAULT_BACKGROUND_LAYER) as BackgroundLayerName;

    if (legacyLayerParam) {
      removeUrlParameter('layers');
      removeUrlParameter('project');
      setUrlParameter('backgroundLayer', finalLayerName);

      const currentThemeLayers = getListUrlParameter('themeLayers') || [];
      const newThemeLayers = [...currentThemeLayers];

      legacyThemeLayerIds.forEach((legacyId) => {
        const modernId = mapLegacyThemeLayerId(
          legacyId,
          configLoadable,
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

    setBackgroundLayer(finalLayerName);
    hasProcessedUrlRef.current = true;
  }, [
    setBackgroundLayer,
    map,
    configLoadable,
    backgroundLayerState,
    addThemeLayerToMap,
  ]);

  useEffect(() => {
    if (!map) {
      return;
    }
    if (hasLoadedThemeLayersRef.current) {
      return;
    }
    const themeLayers = getListUrlParameter('themeLayers');
    if (!themeLayers) {
      return;
    }
    themeLayers.forEach((layerName) => {
      addThemeLayerToMap(layerName as ThemeLayerName);
    });
    hasLoadedThemeLayersRef.current = true;
  }, [map, addThemeLayerToMap]);

  useEffect(() => {
    if (hasLoadedDrawingRef.current) {
      return;
    }
    const asyncEffect = async () => {
      const drawingId = getUrlParameter('drawing');
      if (drawingId) {
        const features = await getFeatures(drawingId);
        setDrawLayerFeatures(features, 'EPSG:4326');
        hasLoadedDrawingRef.current = true;
      }
    };
    asyncEffect();
  }, [map, setDrawLayerFeatures]);

  (useEffect(() => {
    if (!map) return;

    const view = map.getView();
    const updateScale = () => {
      const resolution = view.getResolution();

      if (resolution) {
        const scale = getScaleFromResolution(resolution, map);
        setScale(scale);
      }
    };

    map.on('moveend', updateScale);
    updateScale();

    return () => {
      map.un('moveend', updateScale);
    };
  }),
    []);

  return (
    <Box position={'relative'} width="100%" height="100%">
      <ErrorBoundary fallback={<Text>{t('map.errorMessage')}</Text>}>
        <Box
          ref={mapRef}
          id="map"
          style={{ width: '100%', height: '100vh' }}
          onContextMenu={(e) => {
            setXPos(e.clientX);
            setYPos(e.clientY);
            setIsMenuOpen(true);
            e.stopPropagation();
            e.preventDefault();
          }}
          onClick={() => {
            setIsMenuOpen(false);
          }}
        />
      </ErrorBoundary>

      <MapContextMenu />
    </Box>
  );
};
