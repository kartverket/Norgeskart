import { getDefaultStore, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { mapAtom } from '../../../atoms';
import {
  hoverAvailableAtom,
  hoverStatusAtom,
  mapToolAtom,
} from '../../../overlay/atoms';
import { activeThemeLayersAtom } from '../../atoms';
import { userStylesAtom } from '../../userStyles';
import { groupStylesFor, hoverGroupsFor } from '../themeLayers/vectorData';
import { isHoverPaused } from './hover';
import { createHoverOverlay } from './hoverOverlay';

type Overlay = NonNullable<Awaited<ReturnType<typeof createHoverOverlay>>>;

export const useHoverOverlay = () => {
  const tool = useAtomValue(mapToolAtom);
  const activeThemeLayers = useAtomValue(activeThemeLayersAtom);
  const userStyles = useAtomValue(userStylesAtom);
  const setAvailable = useSetAtom(hoverAvailableAtom);
  const setStatus = useSetAtom(hoverStatusAtom);
  const overlay = useRef<Overlay | null>(null);
  const paused = isHoverPaused(tool);

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const store = getDefaultStore();
    const map = store.get(mapAtom);
    createHoverOverlay(map, setStatus)
      .then((created) => {
        if (!created) return;
        if (cancelled) return created.dispose();
        dispose = () => {
          created.dispose();
          map.removeLayer(created.layer);
          overlay.current = null;
        };
        created.layer.setVisible(!isHoverPaused(store.get(mapToolAtom)));
        created.setGroupStyles(groupStylesFor(store.get(userStylesAtom)));
        created.setActiveGroups(
          hoverGroupsFor(store.get(activeThemeLayersAtom)),
        );
        overlay.current = created;
        map.addLayer(created.layer);
        setAvailable(true);
      })
      // Our vector tiles are internal: the map works without them.
      .catch((error) => console.warn('Hover overlay not available', error));
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [setAvailable, setStatus]);

  useEffect(() => {
    overlay.current?.layer.setVisible(!paused);
  }, [paused]);

  useEffect(() => {
    overlay.current?.setActiveGroups(hoverGroupsFor(activeThemeLayers));
  }, [activeThemeLayers]);

  useEffect(() => {
    overlay.current?.setGroupStyles(groupStylesFor(userStyles));
  }, [userStyles]);
};
