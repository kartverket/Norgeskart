import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import { useMapSettings } from '../../map/mapHooks';
import { getInputCRS } from '../../shared/utils/crsUtils';
import { SearchResult } from '../../types/searchTypes';
import {
  allSearchResultsAtom,
  coordinateResultsAtom,
  hoveredResultAtom,
  selectedResultAtom,
} from '../atoms';
import { updateSearchMarkers } from './updateSearchMarkers';

// Single owner of the search marker layer. Lives in Layout (always mounted) so markers
// don't depend on which panel is visible — e.g. markerLon/markerLat links preselect a result.
export const useSearchMarkers = () => {
  const { setMapLocation } = useMapSettings();
  const coord = useAtomValue(coordinateResultsAtom);
  const allResults = useAtomValue(allSearchResultsAtom);
  const hoveredResult = useAtomValue(hoveredResultAtom);
  const [selectedResult, setSelectedResult] = useAtom(selectedResultAtom);

  const coordResult: SearchResult | null = useMemo(
    () =>
      coord
        ? {
            type: 'Coordinate',
            name: `Coordinate: ${coord.formattedString}`,
            lat: coord.lat,
            lon: coord.lon,
            coordinate: coord,
          }
        : null,
    [coord],
  );

  const handleMarkerClick = useCallback(
    (res: SearchResult) => {
      setSelectedResult(res);
      if (Number.isFinite(res.lon) && Number.isFinite(res.lat)) {
        setMapLocation([res.lon, res.lat], getInputCRS(res), 15);
      }
    },
    [setSelectedResult, setMapLocation],
  );

  useEffect(() => {
    updateSearchMarkers(
      [...(coordResult ? [coordResult] : []), ...allResults],
      hoveredResult,
      selectedResult,
      handleMarkerClick,
    );
  }, [
    allResults,
    coordResult,
    hoveredResult,
    selectedResult,
    handleMarkerClick,
  ]);
};
