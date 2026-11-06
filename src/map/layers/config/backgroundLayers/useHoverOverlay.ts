import MapLibreLayer from '@geoblocks/ol-maplibre-layer/lib/MapLibreLayer';
import { getDefaultStore, useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { mapAtom } from '../../../atoms';
import { isVectorTileLayer } from '../../backgroundLayers';
import { backgroundLayerAtom } from './atoms';
import { createHoverOverlay } from './hoverOverlay';

export const useHoverOverlay = () => {
  const backgroundLayer = useAtomValue(backgroundLayerAtom);
  const overlay = useRef<MapLibreLayer | null>(null);
  // Vector backgrounds handle hover themselves, on the same data.
  const visible = !isVectorTileLayer(backgroundLayer);

  useEffect(() => {
    let cancelled = false;
    createHoverOverlay()
      .then((layer) => {
        if (!layer || cancelled) return;
        overlay.current = layer;
        layer.setVisible(
          !isVectorTileLayer(getDefaultStore().get(backgroundLayerAtom)),
        );
        getDefaultStore().get(mapAtom).addLayer(layer);
      })
      // Hover is an extra: the map works without it, e.g. off the internal network.
      .catch((error) => console.warn('Hover overlay not available', error));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    overlay.current?.setVisible(visible);
  }, [visible]);
};
