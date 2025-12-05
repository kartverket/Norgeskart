import { getDefaultStore, useAtomValue, useSetAtom } from 'jotai';
import { MapBrowserEvent } from 'ol';
import BaseEvent from 'ol/events/Event';
import { useCallback, useEffect } from 'react';
import { mapAtom } from '../atoms';
import {
  featureInfoLoadingAtom,
  featureInfoPanelOpenAtom,
  featureInfoResultAtom,
} from './atoms';
import {
  fetchAllFeatureInfo,
  getVisibleVectorLayers,
  hasVisibleQueryableLayers,
} from './featureInfoService';

export const useFeatureInfoClick = () => {
  const setFeatureInfoResult = useSetAtom(featureInfoResultAtom);
  const setFeatureInfoLoading = useSetAtom(featureInfoLoadingAtom);
  const setFeatureInfoPanelOpen = useSetAtom(featureInfoPanelOpenAtom);

  const handleMapClick = useCallback(
    async (e: Event | BaseEvent) => {
      const map = getDefaultStore().get(mapAtom);
      const contextMenuOpen = document.querySelector(
        '[data-context-menu-open]',
      );
      if (contextMenuOpen) {
        return;
      }

      if (!(e instanceof MapBrowserEvent)) {
        return;
      }

      const hasWmsLayers = hasVisibleQueryableLayers(map);
      const hasVectorLayers = getVisibleVectorLayers(map).length > 0;

      if (!hasWmsLayers && !hasVectorLayers) {
        setFeatureInfoPanelOpen(false);
        return;
      }

      const coordinate = e.coordinate;
      const pixel = e.pixel as [number, number];

      setFeatureInfoLoading(true);

      try {
        const result = await fetchAllFeatureInfo(map, coordinate, pixel);

        if (result.layers.length > 0) {
          setFeatureInfoResult(result);
          setFeatureInfoPanelOpen(true);
        } else {
          setFeatureInfoResult(result);
          setFeatureInfoPanelOpen(false);
        }
      } catch (error) {
        console.error('Error fetching feature info:', error);
        setFeatureInfoResult(null);
        setFeatureInfoPanelOpen(false);
      } finally {
        setFeatureInfoLoading(false);
      }
    },
    [setFeatureInfoResult, setFeatureInfoLoading, setFeatureInfoPanelOpen],
  );

  useEffect(() => {
    const map = getDefaultStore().get(mapAtom);
    map.on('singleclick', handleMapClick);
    return () => {
      map.un('singleclick', handleMapClick);
    };
  }, [handleMapClick]);

  const closeFeatureInfoPanel = useCallback(() => {
    setFeatureInfoPanelOpen(false);
  }, [setFeatureInfoPanelOpen]);

  const clearFeatureInfo = useCallback(() => {
    setFeatureInfoResult(null);
    setFeatureInfoPanelOpen(false);
  }, [setFeatureInfoResult, setFeatureInfoPanelOpen]);

  return {
    closeFeatureInfoPanel,
    clearFeatureInfo,
  };
};

export const useFeatureInfo = () => {
  const featureInfoResult = useAtomValue(featureInfoResultAtom);
  const featureInfoLoading = useAtomValue(featureInfoLoadingAtom);
  const featureInfoPanelOpen = useAtomValue(featureInfoPanelOpenAtom);
  const setFeatureInfoPanelOpen = useSetAtom(featureInfoPanelOpenAtom);

  const closePanel = useCallback(() => {
    setFeatureInfoPanelOpen(false);
  }, [setFeatureInfoPanelOpen]);

  return {
    result: featureInfoResult,
    loading: featureInfoLoading,
    panelOpen: featureInfoPanelOpen,
    closePanel,
  };
};
