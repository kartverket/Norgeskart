import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Image,
  Search,
  Spinner,
} from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getBackgroundLayerImageName } from '../map/atoms';
import { activeBackgroundLayerAtom } from '../map/layers/atoms.ts';
import { BackgroundLayerSettings } from '../settings/map/BackgroundLayerSettings.tsx';
import { SearchResult } from '../types/searchTypes.ts';
import {
  allSearchResultsAtom,
  searchPendingAtom,
  searchQueryAtom,
  useResetSearchResults,
} from './atoms.ts';
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
  const [hoveredResult, setHoveredResult] = useState<SearchResult | null>(null);
  const [showBackgroundSettings, setShowBackgroundSettings] = useState(false);
  const { t } = useTranslation();
  const activeBackgroundLayer = useAtomValue(activeBackgroundLayerAtom);
  const settingsHoverTimeoutRef = useRef<number | null>(null);
  const iconHoverTimeoutRef = useRef<number | null>(null);
  const backgroundImageName = getBackgroundLayerImageName(
    activeBackgroundLayer,
  );
  const backgroundImageUrl = `/backgroundlayerImages/${backgroundImageName}.png`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setHoveredResult(null);
    setShowBackgroundSettings(false);
  };

  const cancelTimeouts = useMemo(() => {
    return () => {
      if (settingsHoverTimeoutRef.current) {
        clearTimeout(settingsHoverTimeoutRef.current);
      }
      if (iconHoverTimeoutRef.current) {
        clearTimeout(iconHoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Flex
      flexDir="column"
      alignItems="stretch"
      gap={2}
      pointerEvents={'auto'}
      px={3}
      pt={3}
      maxH={'100%'}
      overflowY={'auto'}
      maxW={'450px'}
    >
      {/* TOPP: kart-flis + søkefelt */}
      <Box backgroundColor="#FFFF" p={2} borderRadius={10}>
        <Flex alignItems="center" gap={2}>
          {/* Kart-flis til venstre */}

          <Button
            width="46px"
            height="44px"
            borderRadius={8}
            overflow="hidden"
            cursor="pointer"
            padding={0}
            onMouseEnter={() => {
              iconHoverTimeoutRef.current = window.setTimeout(
                () => setShowBackgroundSettings(true),
                100,
              );
            }}
            onMouseLeave={() => {
              cancelTimeouts();
              settingsHoverTimeoutRef.current = window.setTimeout(() => {
                setShowBackgroundSettings(false);
              }, 700);
            }}
            onClick={() => {
              setShowBackgroundSettings(!showBackgroundSettings);
              cancelTimeouts();
            }}
            boxShadow="md"
          >
            <Image
              src={backgroundImageUrl}
              alt="Velg bakgrunnskart"
              width="100%"
              height="100%"
              objectFit="cover"
            />
          </Button>

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

      <SearchResults
        hoveredResult={hoveredResult}
        setHoveredResult={setHoveredResult}
      />
      {showBackgroundSettings && (
        <Box
          onMouseLeave={() => {
            settingsHoverTimeoutRef.current = window.setTimeout(() => {
              setShowBackgroundSettings(false);
            }, 700);
          }}
          onMouseEnter={() => {
            cancelTimeouts();
          }}
        >
          <BackgroundLayerSettings
            onSelectComplete={() => setShowBackgroundSettings(false)}
          />
        </Box>
      )}
    </Flex>
  );
};
