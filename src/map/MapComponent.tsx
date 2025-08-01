import { Box, Text } from '@kvib/react';
import { useAtomValue } from 'jotai';
import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from '../shared/ErrorBoundary.tsx';
import { mapAtom } from './atoms.ts';
import { loadableWMTS } from './layers/backgroundProviders.ts';
import { useMap, useMapSettings } from './mapHooks.ts';
import { MapOverlay } from './MapOverlay.tsx';

export const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const WMTSloadable = useAtomValue(loadableWMTS);
  const { setWMTSBackgroundLayer } = useMapSettings();
  const map = useAtomValue(mapAtom);
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

  useEffect(() => {
    if (WMTSloadable.state !== 'hasData') {
      return;
    }
    if (!map) {
      return;
    }
    const hasBackgroundLayer =
      map.getAllLayers().find((l) => {
        return l.get('id')?.startsWith('bg_');
      }) != null;

    if (hasBackgroundLayer) {
      return;
    }
    const wmtsLayer = WMTSloadable.data;
    if (wmtsLayer) {
      setWMTSBackgroundLayer('kartverketCache', 'topo');
    } else {
      console.error(t('map.errorMessage'));
    }
  }, [setWMTSBackgroundLayer, t, WMTSloadable, map]);

  return (
    <ErrorBoundary fallback={<Text>{t('map.errorMessage')}</Text>}>
      <Box position={'relative'} width="100%" height="100%">
        <Box ref={mapRef} id="map" style={{ width: '100%', height: '100vh' }} />
        <MapOverlay />
      </Box>
    </ErrorBoundary>
  );
};
