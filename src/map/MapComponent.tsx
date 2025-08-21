import { Box, Text } from '@kvib/react';
import { useAtomValue } from 'jotai';
import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getFeatures } from '../api/nkApiClient.ts';
import { useDrawSettings } from '../draw/drawHooks.ts';
import { ErrorBoundary } from '../shared/ErrorBoundary.tsx';
import { getUrlParameter } from '../shared/utils/urlUtils.ts';
import { mapAtom } from './atoms.ts';
import {
  DEFAULT_BACKGROUND_LAYER,
  loadableWMTS,
  WMTSLayerName,
  WMTSProviderId,
} from './layers/backgroundProviders.ts';
import { useMap, useMapSettings } from './mapHooks.ts';
import { MapOverlay } from './MapOverlay.tsx';

export const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const WMTSloadable = useAtomValue(loadableWMTS);
  const { setBackgroundLayer } = useMapSettings();
  const map = useAtomValue(mapAtom);
  const { t } = useTranslation();
  const { setDrawLayerFeatures } = useDrawSettings();

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
    if (WMTSloadable.state !== 'hasData') {
      return;
    }
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
    const [providerId, layerName] = (
      getUrlParameter('backgroundLayer') || DEFAULT_BACKGROUND_LAYER
    ).split('.');

    const wmtsLayer = WMTSloadable.data;
    if (wmtsLayer) {
      setBackgroundLayer(
        providerId as WMTSProviderId,
        layerName as WMTSLayerName,
      );
    } else {
      console.error(t('map.errorMessage'));
    }
  }, [setBackgroundLayer, t, WMTSloadable, map]);

  useEffect(() => {
    const asyncEffect = async () => {
      const drawingId = getUrlParameter('drawing');
      if (drawingId) {
        const features = await getFeatures(drawingId);
        setDrawLayerFeatures(features, 'EPSG:4326');
      }
    };
    asyncEffect();
  }, [map]);

  return (
    <ErrorBoundary fallback={<Text>{t('map.errorMessage')}</Text>}>
      <Box position={'relative'} width="100%" height="100%">
        <Box ref={mapRef} id="map" style={{ width: '100%', height: '100vh' }} />
        <MapOverlay />
      </Box>
    </ErrorBoundary>
  );
};
