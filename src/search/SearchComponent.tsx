import { Box, Flex, Icon, IconButton, Search } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom, ProjectionIdentifier } from '../map/atoms';
import {
  parseCoordinateInput,
  ParsedCoordinate,
} from '../shared/utils/coordinateParser.ts';
import { SearchResult } from '../types/searchTypes.ts';
import { InfoBox } from './infobox/InfoBox.tsx';
import { CoordinateResults } from './results/CoordinateResults.tsx';
import { SearchResults } from './results/SearchResults.tsx';
import {
  useAddresses,
  usePlaceNames,
  useProperties,
  useRoads,
} from './useSearchQueries.ts';

export const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [placesPage, setPlacesPage] = useState(1);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null,
  );
  const [hoveredResult, setHoveredResult] = useState<SearchResult | null>(null);
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);

  const { placeNameData } = usePlaceNames(searchQuery, placesPage);
  const { roadsData } = useRoads(searchQuery);
  const { propertiesData } = useProperties(searchQuery);
  const { addressData } = useAddresses(searchQuery);

  // Get current projection from map
  const currentProjection = useMemo<ProjectionIdentifier>(() => {
    return map.getView().getProjection().getCode() as ProjectionIdentifier;
  }, [map]);

  // Detect if search query is a coordinate, using current projection as fallback
  const coordinateResult = useMemo<ParsedCoordinate | null>(() => {
    return parseCoordinateInput(searchQuery, currentProjection);
  }, [searchQuery, currentProjection]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedResult(null);
    setHoveredResult(null);
  }, []);

  return (
    <Flex flexDir="column" alignItems="stretch" gap={4} p={4}>
      <Box position="relative" width="100%">
        <Box position="relative" width="100%">
          <Search
            width="100%"
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={handleChange}
            height="45px"
            fontSize="1.1rem"
            bg="white"
          />
          <Box
            position="absolute"
            right="10px"
            top="50%"
            transform="translateY(-50%)"
          >
            {searchQuery === '' ? (
              <Icon icon="search" size={24} weight={500} color="gray" />
            ) : (
              <IconButton
                icon="close"
                variant="ghost"
                color={'gray'}
                size={24}
                onClick={() => setSearchQuery('')}
              />
            )}
          </Box>
        </Box>
      </Box>

      {coordinateResult ? (
        <CoordinateResults
          coordinate={coordinateResult}
          selectedResult={selectedResult}
          setSelectedResult={setSelectedResult}
          hoveredResult={hoveredResult}
          setHoveredResult={setHoveredResult}
        />
      ) : (
        <SearchResults
          properties={propertiesData ? propertiesData : []}
          roads={roadsData ? roadsData : []}
          places={placeNameData ? placeNameData.navn : []}
          addresses={addressData ? addressData.adresser : []}
          placesMetadata={placeNameData?.metadata}
          onPlacesPageChange={(page: number) => {
            setPlacesPage(page);
          }}
          searchQuery={searchQuery}
          selectedResult={selectedResult}
          setSelectedResult={setSelectedResult}
          hoveredResult={hoveredResult}
          setHoveredResult={setHoveredResult}
        />
      )}
      {selectedResult && (
        <InfoBox
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </Flex>
  );
};
