import { getDefaultStore } from 'jotai';
import { useEffect } from 'react';
import { mapAtom } from '../../../atoms';
import { createHoverOverlay } from './hoverOverlay';

export const useHoverOverlay = () => {
  useEffect(() => {
    let cancelled = false;
    createHoverOverlay()
      .then((layer) => {
        if (layer && !cancelled) getDefaultStore().get(mapAtom).addLayer(layer);
      })
      // Hover is an extra: the map works without it, e.g. off the internal network.
      .catch((error) => console.warn('Hover overlay not available', error));
    return () => {
      cancelled = true;
    };
  }, []);
};
