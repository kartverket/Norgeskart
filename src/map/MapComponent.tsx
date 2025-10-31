import { Box, Text } from '@kvib/react';
import { useAtomValue, useSetAtom } from 'jotai';
import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getFeatures } from '../api/nkApiClient.ts';
import { useDrawSettings } from '../draw/drawControls/hooks/drawSettings.ts';
import { ErrorBoundary } from '../shared/ErrorBoundary.tsx';
import {
  getListUrlParameter,
  getUrlParameter,
} from '../shared/utils/urlUtils.ts';
import { mapAtom } from './atoms.ts';
import { BackgroundLayerName } from './layers/backgroundLayers.ts';
import { DEFAULT_BACKGROUND_LAYER } from './layers/backgroundWMTSProviders.ts';
import { useThemeLayers } from './layers/themeLayers.ts';
import { ThemeLayerName } from './layers/themeWMS.ts';
import { useMap, useMapSettings } from './mapHooks.ts';
import {
  mapContextIsOpenAtom,
  mapContextXPosAtom,
  mapContextYPosAtom,
} from './menu/atoms.ts';
import { MapContextMenu } from './menu/MapContextMenu.tsx';
import { MapOverlay } from './overlay/MapOverlay.tsx';

export const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { setBackgroundLayer } = useMapSettings();
  const { addThemeLayerToMap } = useThemeLayers();
  const map = useAtomValue(mapAtom);
  const { t } = useTranslation();
  const { setDrawLayerFeatures } = useDrawSettings();
  const setIsMenuOpen = useSetAtom(mapContextIsOpenAtom);
  const setXPos = useSetAtom(mapContextXPosAtom);
  const setYPos = useSetAtom(mapContextYPosAtom);

  const { setTargetElement } = useMap();

  useEffect(() => {
    if (mapRef.current) {
      setTargetElement(mapRef.current);
    }
    return () => {
      setTargetElement(null);
    };
  }, [setTargetElement, mapRef]);

  useEffect(() => {
    if (!map) {
      return;
    }
    const hasBackgroundLayer =
      map.getAllLayers().find((l) => {
        return l.get('id')?.startsWith('bg.');
      }) != null;

    if (hasBackgroundLayer) {
      return;
    }
    const layerNameFromUrl = (getUrlParameter('backgroundLayer') ||
      DEFAULT_BACKGROUND_LAYER) as BackgroundLayerName;

    setBackgroundLayer(layerNameFromUrl);
  }, [setBackgroundLayer, map]);

  useEffect(() => {
    if (!map) {
      return;
    }
    const themeLayers = getListUrlParameter('themeLayers');
    if (!themeLayers) {
      return;
    }
    themeLayers.forEach((layerName) => {
      addThemeLayerToMap(layerName as ThemeLayerName);
    });
  }, [map, addThemeLayerToMap]);

  useEffect(() => {
    const asyncEffect = async () => {
      const drawingId = getUrlParameter('drawing');
      if (drawingId) {
        const features = await getFeatures(drawingId);
        setDrawLayerFeatures(features, 'EPSG:4326');
      }
    };
    asyncEffect();
  }, [map, setDrawLayerFeatures]);

  return (
    <ErrorBoundary fallback={<Text>{t('map.errorMessage')}</Text>}>
      <Box position={'relative'} width="100%" height="100%">
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
        <MapOverlay />
        <MapContextMenu />
      </Box>
    </ErrorBoundary>
  );
};
