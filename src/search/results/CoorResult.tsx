import { List } from '@kvib/react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMapSettings } from '../../map/mapHooks';
import { getInputCRS } from '../../shared/utils/crsUtils';
import { SearchResult } from '../../types/searchTypes';
import { SearchResultLine } from './SearchResultLine';

interface CoordinateResultsProps {
  coordinateResult: SearchResult | null;
  setSelectedResult: (result: SearchResult) => void;
  handleHover: (res: SearchResult) => void;
  setHoveredResult: (result: SearchResult | null) => void;
}

export const CoordinateResults = ({
  coordinateResult,
  setSelectedResult,
  handleHover,
  setHoveredResult,
}: CoordinateResultsProps) => {
  const { t } = useTranslation();
  const { setMapLocation } = useMapSettings();

  const handleSearchClick = useCallback(
    (res: SearchResult) => {
      const { lon, lat } = res;
      setSelectedResult(res);
      setMapLocation([lon, lat], getInputCRS(res), 15);
    },
    [setSelectedResult, setMapLocation],
  );

  if (!coordinateResult || coordinateResult.type !== 'Coordinate') {
    return null;
  }

  return (
    <List>
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
