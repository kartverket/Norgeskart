import { Box, Text } from '@kvib/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getFeatures } from '../api/nkApiClient.ts';
import { useDrawSettings } from '../draw/drawControls/hooks/drawSettings.ts';
import { ErrorBoundary } from '../shared/ErrorBoundary.tsx';
import {
  getAllUrlParameters,
  getUrlParameter,
} from '../shared/utils/urlUtils.ts';
import { mapAtom, projectionEffect, scaleAtom } from './atoms.ts';
import { trackPostitionAtomEffect } from './geolocation/atoms.ts';
import { themeLayerEffect } from './layers/atoms.ts';
import { backgroundLayerAtomEffect } from './layers/config/backgroundLayers/atoms.ts';
import {
  createUrlGeoJsonLayer,
  urlGeoJsonLayersAtom,
} from './layers/urlGeoJson.ts';
import { useMap } from './mapHooks.ts';
import { createEmpty, extend as extendExtent, isEmpty } from 'ol/extent';
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
  const hasLoadedGeoJsonRef = useRef(false);
  const setUrlGeoJsonLayers = useSetAtom(urlGeoJsonLayersAtom);
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
        if (!features) {
          console.warn(`No features found for drawing id: ${drawingId}`);
          return;
        }
        setDrawLayerFeatures(features, 'EPSG:4326');
        hasLoadedDrawingRef.current = true;
      }
    };
    asyncEffect();
  }, [map, setDrawLayerFeatures]);

  useEffect(() => {
    if (!map || hasLoadedGeoJsonRef.current) return;

    const geojsonUrls = getAllUrlParameters('geojsonUrl');
    console.log('[urlGeoJson] effect ran, urls:', geojsonUrls);
    if (geojsonUrls.length === 0) return;

    hasLoadedGeoJsonRef.current = true;
    const mapProjection = map.getView().getProjection().getCode();
    console.log('[urlGeoJson] mapProjection:', mapProjection);

    void (async () => {
      const layers = await Promise.all(
        geojsonUrls.map((url, index) =>
          createUrlGeoJsonLayer(url, mapProjection, index),
        ),
      );
      layers.forEach((layer) => map.addLayer(layer));
      setUrlGeoJsonLayers(layers);
      console.log('[urlGeoJson] layers added:', layers.length);
      const combinedExtent = createEmpty();
      layers.forEach((layer) => {
        const ext = layer.getSource()?.getExtent();
        if (ext && !isEmpty(ext)) extendExtent(combinedExtent, ext);
      });
      console.log('[urlGeoJson] fitting view to extent:', combinedExtent);
      if (!isEmpty(combinedExtent)) {
        map.getView().fit(combinedExtent, { padding: [50, 50, 50, 50], maxZoom: 12 });
      }
    })();
  }, [map, setUrlGeoJsonLayers]);

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
