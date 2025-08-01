import { Box, Text } from '@kvib/react';
import { useAtomValue } from 'jotai';
import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from '../shared/ErrorBoundary.tsx';
import { loadableWMTS } from './layers/backgroundProviders.ts';
import { useMap, useMapSettings } from './mapHooks.ts';
import { MapOverlay } from './MapOverlay.tsx';

export const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const WMTSloadable = useAtomValue(loadableWMTS);
  const { setWMTSBackgroundLayer } = useMapSettings();
  const { t } = useTranslation();

  const { setTargetElement } = useMap();

  useEffect(() => {
    if (mapRef.current) {
      setTargetElement(mapRef.current);
    }
    return () => {
      setTargetElement(null);
    };
  }, [setTargetElement, mapRef]);

  // Used to set the WMTS background layer on the first render.
  // The loadable will be renewed when the projection settings changes,
  // but that should not trigger a new layer addition.
  useEffect(() => {
    if (WMTSloadable.state !== 'hasData') {
      return;
    }
    const wmtsLayer = WMTSloadable.data;
    if (wmtsLayer && firstRender.current) {
      setWMTSBackgroundLayer('kartverketCache', 'topo');
      firstRender.current = false;
    } else {
      console.error(t('map.errorMessage'));
    }
  }, [WMTSloadable]);

  return (
    <ErrorBoundary fallback={<Text>{t('map.errorMessage')}</Text>}>
      <Box position={'relative'} width="100%" height="100%">
        <Box ref={mapRef} id="map" style={{ width: '100%', height: '100vh' }} />
        <MapOverlay />
      </Box>
    </ErrorBoundary>
  );
};
