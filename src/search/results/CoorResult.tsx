import { Alert, Button, List, Stack, Text } from '@kvib/react';
import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMapSettings } from '../../map/mapHooks';
import { isLikelyLonLatSwap } from '../../shared/utils/coordinateParser';
import { getInputCRS } from '../../shared/utils/crsUtils';
import { SearchResult } from '../../types/searchTypes';
import { searchQueryAtom } from '../atoms';
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
  const setSearchQuery = useSetAtom(searchQueryAtom);

  const handleSearchClick = useCallback(
    (res: SearchResult) => {
      const { lon, lat } = res;
      setSelectedResult(res);
      setMapLocation([lon, lat], getInputCRS(res), 15);
    },
    [setSelectedResult, setMapLocation],
  );

  const handleSwapCoordinates = useCallback(() => {
    if (!coordinateResult || coordinateResult.type !== 'Coordinate') return;
    const coordResult = coordinateResult as Extract<
      SearchResult,
      { type: 'Coordinate' }
    >;
    const { lat, lon } = coordResult.coordinate;
    // What was parsed as lat is actually lon, and vice versa — swap them.
    const swappedLat = lon;
    const swappedLon = lat;
    const correctedQuery = `${swappedLat.toFixed(5)},${swappedLon.toFixed(5)}@EPSG:4326`;
    setSearchQuery(correctedQuery);
    const swappedResult: SearchResult = {
      ...coordResult,
      lat: swappedLat,
      lon: swappedLon,
      coordinate: {
        ...coordResult.coordinate,
        lat: swappedLat,
        lon: swappedLon,
        formattedString: `${swappedLat.toFixed(5)}, ${swappedLon.toFixed(5)} (WGS84)`,
      },
    };
    handleSearchClick(swappedResult);
  }, [coordinateResult, setSearchQuery, handleSearchClick]);

  if (!coordinateResult || coordinateResult.type !== 'Coordinate') {
    return null;
  }

  const showSwapWarning =
    coordinateResult.coordinate != null &&
    isLikelyLonLatSwap(coordinateResult.coordinate);

  return (
    <Stack gap={1}>
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
      {showSwapWarning && (
        <Alert status="warning">
          <Stack gap={2} alignItems="flex-start">
            <Text fontSize="sm">{t('search.coordinateSwapWarning')}</Text>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSwapCoordinates}
            >
              {t('search.coordinateSwapButton')}
            </Button>
          </Stack>
        </Alert>
      )}
    </Stack>
  );
};
