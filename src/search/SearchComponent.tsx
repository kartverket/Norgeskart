import {
  Box,
  Flex,
  Icon,
  IconButton,
  Image,
  Search,
  Spinner,
} from '@kvib/react';
import { getDefaultStore, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Feature, MapBrowserEvent } from 'ol';
import BaseEvent from 'ol/events/Event';
import { Geometry } from 'ol/geom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  activeBackgroundLayerAtom,
  getBackgroundLayerImageName,
  mapAtom,
  ProjectionIdentifier,
} from '../map/atoms';
import { mapContextIsOpenAtom } from '../map/menu/atoms.ts';
import { BackgroundLayerSettings } from '../settings/map/BackgroundLayerSettings.tsx';
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
  const [showBackgroundSettings, setShowBackgroundSettings] = useState(false);
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const activeBackgroundLayer = useAtomValue(activeBackgroundLayerAtom);
  const backgroundImageName = getBackgroundLayerImageName(
    activeBackgroundLayer,
  );
  const backgroundImageUrl = `/backgroundlayerImages/${backgroundImageName}.png`;
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
    setHoveredResult(null);
    setShowBackgroundSettings(false);
  };

  const toggleBackgroundSettings = () => {
    setShowBackgroundSettings((prev) => !prev);
  };

  //I hate this function
  const isClusterClick = useCallback((e: MapBrowserEvent): boolean => {
    const map = getDefaultStore().get(mapAtom);
    const features = map.getFeaturesAtPixel(e.pixel);
    // Check if the click is on a cluster
    const isCluster =
      features &&
      features.length === 1 &&
      features[0].get('features') &&
      Array.isArray(features[0].get('features')) &&
      features[0].get('features').length > 1;

    const hasMarkerFeature =
      features &&
      features.some((f) => {
        return f.get('features').some((ff: Feature<Geometry>) => {
          return ff.get('isMarker') === true;
        });
      });

    return isCluster || hasMarkerFeature;
  }, []);

  const handlePositionClick = useCallback(
    (e: MapBrowserEvent) => {
      const map = getDefaultStore().get(mapAtom);
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
    },
    [setSearchCoordinates, setSelectedResult],
  );

  const mapClickHandler = useCallback(
    (e: Event | BaseEvent) => {
      const isContextMenuOpen = getDefaultStore().get(mapContextIsOpenAtom);
      if (isContextMenuOpen) {
        return;
      }
      if (e instanceof MapBrowserEvent) {
        const isClickClusterClick = isClusterClick(e);

        if (isClickClusterClick) {
          return;
        }
        handlePositionClick(e);
      }
    },
    [handlePositionClick, isClusterClick],
  );
  useEffect(() => {
    const map = getDefaultStore().get(mapAtom);
    map.addEventListener('click', mapClickHandler);
    return () => {
      map.removeEventListener('click', mapClickHandler);
    };
  }, [mapClickHandler]);

  return (
    <Flex
      flexDir="column"
      alignItems="stretch"
      gap={2}
      pointerEvents={'auto'}
      px={3}
      pt={3}
    >
      {/* TOPP: kart-flis + søkefelt */}
      <Box backgroundColor="#FFFF" p={2} borderRadius={10} maxWidth="450px">
        <Flex alignItems="center" gap={2}>
          {/* Kart-flis til venstre */}
          <Box
            width="46px"
            height="44px"
            borderRadius={8}
            overflow="hidden"
            cursor="pointer"
            onClick={toggleBackgroundSettings}
            boxShadow="md"
          >
            <Image
              src={backgroundImageUrl}
              alt="Velg bakgrunnskart"
              width="100%"
              height="100%"
              objectFit="cover"
            />
          </Box>

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
        </Flex>
      </Box>
      {showBackgroundSettings ? (
        <Box
          bg="white"
          borderRadius="md"
          boxShadow="md"
          maxWidth="450px"
          py={2}
        >
          <BackgroundLayerSettings />
        </Box>
      ) : coordinateResult ? (
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
