import { List } from '@kvib/react';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMapSettings } from '../../map/mapHooks';
import { getInputCRS } from '../../shared/utils/crsUtils';
import { SearchResult } from '../../types/searchTypes';
import { updateSearchMarkers } from '../searchmarkers/updateSearchMarkers';
import { SearchResultLine } from './SearchResultLine';

interface CoordinateResultsProps {
  coordinateResult: SearchResult | null;
  setSelectedResult: (result: SearchResult | null) => void;
  hoveredResult: SearchResult | null;
  setHoveredResult: (result: SearchResult | null) => void;
}

export const CoordinateResults = ({
  coordinateResult,
  setSelectedResult,
  hoveredResult,
  setHoveredResult,
}: CoordinateResultsProps) => {
  const { t } = useTranslation();
  const { setMapLocation } = useMapSettings();

  const allResults = useMemo<SearchResult[]>(
    () => (coordinateResult ? [coordinateResult] : []),
    [coordinateResult],
  );

  const handleHover = (res: SearchResult) => {
    setHoveredResult(res);
  };

  const handleSearchClick = useCallback(
    (res: SearchResult) => {
      const { lon, lat } = res;
      setSelectedResult(res);
      setMapLocation([lon, lat], getInputCRS(res), 15);
    },
    [setSelectedResult, setMapLocation],
  );

  useEffect(() => {
    updateSearchMarkers(
      allResults,
      hoveredResult,
      coordinateResult,
      handleSearchClick,
    );
  }, [allResults, hoveredResult, coordinateResult, handleSearchClick]);

  if (!coordinateResult || coordinateResult.type !== 'Coordinate') {
    return null;
  }

  return (
    <List backgroundColor="white" mt="5px" borderRadius={10} padding={2}>
      <SearchResultLine
        key="coordinate-result"
        heading={coordinateResult.coordinate.formattedString}
        locationType={
          t('infoBox.coordinateSystem') +
          ': ' +
          coordinateResult.coordinate.projection
        }
        onClick={() => handleSearchClick(coordinateResult)}
        onMouseEnter={() => handleHover(coordinateResult)}
        onMouseLeave={() => setHoveredResult(null)}
      />
    </List>
  );
};
