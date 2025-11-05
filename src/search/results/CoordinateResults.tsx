import { List } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../map/atoms';
import { useMapSettings } from '../../map/mapHooks';
import { ParsedCoordinate } from '../../shared/utils/coordinateParser';
import { getInputCRS } from '../../shared/utils/crsUtils';
import { SearchResult } from '../../types/searchTypes';
import { InfoBox } from '../infobox/InfoBox';
import { updateSearchMarkers } from '../searchmarkers/updateSearchMarkers';
import { SearchResultLine } from './SearchResultLine';

interface CoordinateResultsProps {
  coordinate: ParsedCoordinate | null;
  selectedResult: SearchResult | null;
  setSelectedResult: (result: SearchResult | null) => void;
  hoveredResult: SearchResult | null;
  setHoveredResult: (result: SearchResult | null) => void;
}

export const CoordinateResults = ({
  coordinate,
  selectedResult,
  setSelectedResult,
  hoveredResult,
  setHoveredResult,
}: CoordinateResultsProps) => {
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const { setMapLocation } = useMapSettings();

  const searchResult: SearchResult | null = useMemo(
    () =>
      coordinate
        ? {
            type: 'Coordinate',
            name: coordinate.formattedString,
            lat: coordinate.lat,
            lon: coordinate.lon,
            coordinate: {
              formattedString: coordinate.formattedString,
              projection: coordinate.projection,
              inputFormat: coordinate.inputFormat,
            },
          }
        : null,
    [coordinate],
  );

  const allResults = useMemo<SearchResult[]>(
    () => (searchResult ? [searchResult] : []),
    [searchResult],
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
      map,
      allResults,
      hoveredResult,
      selectedResult,
      handleSearchClick,
    );
  }, [map, allResults, hoveredResult, selectedResult, handleSearchClick]);

  if (!coordinate || !searchResult) {
    return null;
  }

  if (selectedResult) {
    return <InfoBox result={selectedResult} />;
  }

  return (
    <List backgroundColor="white" mt="5px" borderRadius={10} padding={2}>
      <SearchResultLine
        key="coordinate-result"
        heading={coordinate.formattedString}
        locationType={
          t('infoBox.coordinateSystem') + ': ' + coordinate.projection
        }
        onClick={() => handleSearchClick(searchResult)}
        onMouseEnter={() => handleHover(searchResult)}
        onMouseLeave={() => setHoveredResult(null)}
      />
    </List>
  );
};
