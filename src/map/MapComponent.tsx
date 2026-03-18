import { Box, Text } from '@kvib/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getFeatures } from '../api/nkApiClient.ts';
import { useDrawSettings } from '../draw/drawControls/hooks/drawSettings.ts';
import { ErrorBoundary } from '../shared/ErrorBoundary.tsx';
import { getUrlParameter } from '../shared/utils/urlUtils.ts';
import { mapAtom, projectionEffect, scaleAtom } from './atoms.ts';
import { trackPostitionAtomEffect } from './geolocation/atoms.ts';
import { themeLayerEffect } from './layers/atoms.ts';
import { backgroundLayerAtomEffect } from './layers/config/backgroundLayers/atoms.ts';
import { useMap } from './mapHooks.ts';
import { getScaleFromResolution } from './mapScale.ts';
import {
  mapContextIsOpenAtom,
  mapContextXPosAtom,
  mapContextYPosAtom,
} from './menu/atoms.ts';
import { MapContextMenu } from './menu/MapContextMenu.tsx';

export const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  const map = useAtomValue(mapAtom);
  const { t } = useTranslation();
  const { setDrawLayerFeatures } = useDrawSettings();
  const setIsMenuOpen = useSetAtom(mapContextIsOpenAtom);
  const setXPos = useSetAtom(mapContextXPosAtom);
  const setYPos = useSetAtom(mapContextYPosAtom);
  const hasLoadedDrawingRef = useRef(false);
  const setScale = useSetAtom(scaleAtom);
  const { setTargetElement } = useMap();
  useAtom(themeLayerEffect);
  useAtom(trackPostitionAtomEffect);
  useAtom(projectionEffect);
  useAtom(backgroundLayerAtomEffect);

  useEffect(() => {
    if (mapRef.current) {
      setTargetElement(mapRef.current);
    }
    return () => {
      setTargetElement(null);
    };
  }, [setTargetElement, mapRef]);

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

  useEffect(() => {
    if (!map) return;

    const updateScale = () => {
      const view = map.getView();
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
  }, [map, setScale]);

  console.log(map);

  return (
    <Box position={'relative'} width="100%" height="100%">
      <ErrorBoundary fallback={<Text>{t('map.errorMessage')}</Text>}>
        <Box
          ref={mapRef}
          id="map"
          style={{ width: '100%', height: '100%' }}
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
