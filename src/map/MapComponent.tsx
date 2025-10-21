import { Box, Text } from '@kvib/react';
import { useAtomValue } from 'jotai';
import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getFeatures } from '../api/nkApiClient.ts';
import { useDrawSettings } from '../draw/drawControls/hooks/drawSettings.ts';
import { ErrorBoundary } from '../shared/ErrorBoundary.tsx';
import { getUrlParameter } from '../shared/utils/urlUtils.ts';
import { mapAtom } from './atoms.ts';
import { BackgroundLayerName } from './layers/backgroundLayers.ts';
import { DEFAULT_BACKGROUND_LAYER } from './layers/backgroundWMTSProviders.ts';
import { useMap, useMapSettings } from './mapHooks.ts';
import { MapOverlay } from './MapOverlay.tsx';

export const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { setBackgroundLayer } = useMapSettings();
  const map = useAtomValue(mapAtom);
  const { t } = useTranslation();
  const { setDrawLayerFeatures, drawEnabled, undoLast, drawType } =
    useDrawSettings();

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
    const asyncEffect = async () => {
      const drawingId = getUrlParameter('drawing');
      if (drawingId) {
        const features = await getFeatures(drawingId);
        setDrawLayerFeatures(features, 'EPSG:4326');
      }
    };
    asyncEffect();
  }, [map, setDrawLayerFeatures]);

  useEffect(() => {
    const handleUndo = () => {
      if (
        drawEnabled &&
        (drawType === 'Polygon' || drawType === 'LineString')
      ) {
        undoLast();
      }
    };
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    mapElement.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleUndo();
    });
    return () => {
      window.removeEventListener('contextmenu', handleUndo);
    };
  }, [drawType, drawEnabled, undoLast]);

  return (
    <ErrorBoundary fallback={<Text>{t('map.errorMessage')}</Text>}>
      <Box position={'relative'} width="100%" height="100%">
        <Box ref={mapRef} id="map" style={{ width: '100%', height: '100vh' }} />
        <MapOverlay />
      </Box>
    </ErrorBoundary>
  );
};
