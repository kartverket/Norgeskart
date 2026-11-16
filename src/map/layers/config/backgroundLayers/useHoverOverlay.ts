import { getDefaultStore, useAtomValue, useSetAtom } from 'jotai';
import type BaseLayer from 'ol/layer/Base';
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
  const overlay = useRef<BaseLayer | null>(null);
  const visible = enabled && !isHoverPaused(tool);

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const store = getDefaultStore();
    const map = store.get(mapAtom);
    createHoverOverlay(map)
      .then((created) => {
        if (!created) return;
        if (cancelled) return created.dispose();
        const { layer } = created;
        dispose = () => {
          created.dispose();
          map.removeLayer(layer);
          overlay.current = null;
        };
        layer.setVisible(
          store.get(hoverEnabledAtom) && !isHoverPaused(store.get(mapToolAtom)),
        );
        overlay.current = layer;
        map.addLayer(layer);
        setAvailable(true);
      })
      // Hover is an extra: the map works without it, e.g. off the internal network.
      .catch((error) => console.warn('Hover overlay not available', error));
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [setAvailable]);

  useEffect(() => {
    overlay.current?.setVisible(visible);
  }, [visible]);
};
