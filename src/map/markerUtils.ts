import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { SearchResult } from '../types/searchTypes';
import { hoveredMarkerAtom, markersAtom, selectedMarkerAtom } from './atoms';

/**
 * Custom hook for managing map markers.
 * Handles setting markers, selecting a marker, and hover effects.
 */
export const useMarkers = (allResults: SearchResult[]) => {
  const setBlueMarkers = useSetAtom(markersAtom);
  const setSelectedMarker = useSetAtom(selectedMarkerAtom);
  const setHoveredMarker = useSetAtom(hoveredMarkerAtom);

  // Update markers when search results change
  useEffect(() => {
    setBlueMarkers(allResults);
  }, [allResults, setBlueMarkers]);

  // Function to select a marker
  const selectMarker = (marker: SearchResult) => {
    setSelectedMarker(marker);
    setHoveredMarker(null);
  };

  // Function to handle hover effects
  const hoverMarker = (marker: SearchResult | null) => {
    setHoveredMarker(marker);
  };

  return { selectMarker, hoverMarker };
};
