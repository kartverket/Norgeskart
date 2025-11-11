import { Box, Flex, Icon, IconButton, Search } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom, ProjectionIdentifier } from '../map/atoms';
import {
  parseCoordinateInput,
  ParsedCoordinate,
} from '../shared/utils/coordinateParser.ts';
import { SearchResult } from '../types/searchTypes.ts';
import { searchQueryAtom, selectedResultAtom } from './atoms.ts';
import { InfoBox } from './infobox/InfoBox.tsx';
import { CoordinateResults } from './results/CoordinateResults.tsx';
import { SearchResults } from './results/SearchResults.tsx';

export const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [selectedResult, setSelectedResult] = useAtom(selectedResultAtom);
  const [hoveredResult, setHoveredResult] = useState<SearchResult | null>(null);
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const currentProjection = useMemo<ProjectionIdentifier>(() => {
    return map.getView().getProjection().getCode() as ProjectionIdentifier;
  }, [map]);

  // Detect if search query is a coordinate, using current projection as fallback
  const coordinateResult = useMemo<ParsedCoordinate | null>(() => {
    return parseCoordinateInput(searchQuery, currentProjection);
  }, [searchQuery, currentProjection]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedResult(null);
    setHoveredResult(null);
  };

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
