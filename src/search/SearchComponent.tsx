import { Box, Flex, Icon, IconButton, Search, Spinner } from '@kvib/react';
import { getDefaultStore, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { MapBrowserEvent } from 'ol';
import BaseEvent from 'ol/events/Event';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom, ProjectionIdentifier } from '../map/atoms';
import { mapContextIsOpenAtom } from '../map/menu/atoms.ts';
import {
  parseCoordinateInput,
  ParsedCoordinate,
} from '../shared/utils/coordinateParser.ts';
import { SearchResult } from '../types/searchTypes.ts';
import {
  allSearchResultsAtom,
  searchCoordinatesAtom,
  searchPendingAtom,
  searchQueryAtom,
  selectedResultAtom,
  useResetSearchResults,
} from './atoms.ts';
import { CoordinateResults } from './results/CoordinateResults.tsx';
import { SearchResults } from './results/SearchResults.tsx';

const SearchIcon = () => {
  const searchQuery = useAtomValue(searchQueryAtom);
  const isSearchPending = useAtomValue(searchPendingAtom);
  const resetSearchResults = useResetSearchResults();
  const allResults = useAtomValue(allSearchResultsAtom);
  if (isSearchPending) {
    return <Spinner />;
  }
  if (allResults.length > 0 || searchQuery !== '') {
    return (
      <IconButton
        icon="close"
        variant="ghost"
        color={'gray'}
        size={24}
        onClick={resetSearchResults}
      />
    );
  }
  if (searchQuery === '') {
    return <Icon icon="search" size={24} weight={500} color="gray" />;
  }
};

export const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const setSelectedResult = useSetAtom(selectedResultAtom);
  const setSearchCoordinates = useSetAtom(searchCoordinatesAtom);
  const [hoveredResult, setHoveredResult] = useState<SearchResult | null>(null);
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const currentProjection = useMemo<ProjectionIdentifier>(() => {
    return map.getView().getProjection().getCode() as ProjectionIdentifier;
  }, [map]);

  // Detect if search query is a coordinate, using current projection as fallback
  const coordinateResult = useMemo<SearchResult | null>(() => {
    const parsedCoordinate = parseCoordinateInput(
      searchQuery,
      currentProjection,
    );
    if (parsedCoordinate == null) {
      return null;
    }

    return {
      lon: parsedCoordinate.lon,
      lat: parsedCoordinate.lat,
      name: parsedCoordinate.formattedString,
      type: 'Coordinate',
      coordinate: parsedCoordinate,
    };
  }, [searchQuery, currentProjection]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedResult(null);
    setHoveredResult(null);
  };

  const mapClickHandler = useCallback(
    (e: Event | BaseEvent) => {
      const isContextMenuOpen = getDefaultStore().get(mapContextIsOpenAtom);
      if (isContextMenuOpen) {
        return;
      }
      if (e instanceof MapBrowserEvent) {
        const coordinate = e.coordinate;
        const projection = map.getView().getProjection().getCode();
        setSearchCoordinates({
          x: coordinate[0],
          y: coordinate[1],
          projection: projection as ProjectionIdentifier,
        });

        const parsedCoordinate: ParsedCoordinate = {
          lat: coordinate[0],
          lon: coordinate[1],
          projection: projection as ProjectionIdentifier,
          formattedString: `${coordinate[0].toFixed(2)}, ${coordinate[1].toFixed(2)} @ ${projection.split(':')[1]}`,
          inputFormat: 'utm',
        };

        setSelectedResult({
          lon: coordinate[0],
          lat: coordinate[1],
          name: parsedCoordinate.formattedString,
          type: 'Coordinate',
          coordinate: parsedCoordinate,
        });
      }
    },
    [map, setSearchCoordinates, setSelectedResult],
  );
  useEffect(() => {
    map.on('click', mapClickHandler);
    return () => {
      map.un('click', mapClickHandler);
    };
  }, [mapClickHandler, map]);

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
            <SearchIcon />
          </Box>
        </Box>
      </Box>

      {coordinateResult ? (
        <CoordinateResults
          coordinateResult={coordinateResult}
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
    </Flex>
  );
};
