import MapLibreLayer from '@geoblocks/ol-maplibre-layer/lib/MapLibreLayer';
import { getDefaultStore, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { mapAtom } from '../../../atoms';
import {
  hoverAvailableAtom,
  hoverEnabledAtom,
  mapToolAtom,
} from '../../../overlay/atoms';
import { isHoverPaused } from './hover';
import { createHoverOverlay } from './hoverOverlay';

export const useHoverOverlay = () => {
  const enabled = useAtomValue(hoverEnabledAtom);
  const tool = useAtomValue(mapToolAtom);
  const setAvailable = useSetAtom(hoverAvailableAtom);
  const overlay = useRef<MapLibreLayer | null>(null);
  const visible = enabled && !isHoverPaused(tool);

  useEffect(() => {
    let cancelled = false;
    createHoverOverlay()
      .then((layer) => {
        if (!layer || cancelled) return;
        const store = getDefaultStore();
        layer.setVisible(
          store.get(hoverEnabledAtom) && !isHoverPaused(store.get(mapToolAtom)),
        );
        overlay.current = layer;
        store.get(mapAtom).addLayer(layer);
        setAvailable(true);
      })
      // Hover is an extra: the map works without it, e.g. off the internal network.
      .catch((error) => console.warn('Hover overlay not available', error));
    return () => {
      cancelled = true;
    };
  }, [setAvailable]);

  useEffect(() => {
    overlay.current?.setVisible(visible);
  }, [visible]);
};
