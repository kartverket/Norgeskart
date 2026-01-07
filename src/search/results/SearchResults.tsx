import { AccordionRoot, Box, Stack } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMapSettings } from '../../map/mapHooks.ts';
import { getInputCRS } from '../../shared/utils/crsUtils.ts';
import { SearchResult } from '../../types/searchTypes.ts';
import {
  allSearchResultsAtom,
  coordinateResultsAtom,
  searchQueryAtom,
  selectedResultAtom,
} from '../atoms.ts';
import { updateSearchMarkers } from '../searchmarkers/updateSearchMarkers.ts';
import { AddressesResults } from './AddressesResults.tsx';
import { CoordinateResults } from './CoorResult.tsx';
import { PlacesResult } from './PlacesResults.tsx';
import { PropertiesResults } from './PropertiesResults.tsx';
import { RoadsResults } from './RoadsResults.tsx';

type AccordionTab = 'places' | 'roads' | 'properties' | 'addresses';

interface SearchResultsProps {
  hoveredResult: SearchResult | null;
  setHoveredResult: (result: SearchResult | null) => void;
}

export const SearchResults = ({
  hoveredResult,
  setHoveredResult,
}: SearchResultsProps) => {
  const { setMapLocation } = useMapSettings();
  const searchQuery = useAtomValue(searchQueryAtom);
  const { t } = useTranslation();
  const [accordionTabsOpen, setAccordionTabsOpen] = useState<AccordionTab[]>([
    'places',
    'roads',
    'properties',
    'addresses',
  ]);
  const coord = useAtomValue(coordinateResultsAtom);
  const coordResult: SearchResult | null = useMemo(() => {
    return coord
      ? {
          type: 'Coordinate',
          name: `Coordinate: ${coord.formattedString}`,
          lat: coord.lat,
          lon: coord.lon,
          coordinate: coord,
        }
      : null;
  }, [coord]);

  const allResults = useAtomValue(allSearchResultsAtom);

  const [selectedResult, setSelectedResult] = useAtom(selectedResultAtom);

  const handleHover = (res: SearchResult) => {
    setHoveredResult(res);
  };

  const handleAccordionTabClick = (value: AccordionTab) => {
    setAccordionTabsOpen((prev) =>
      prev.includes(value)
        ? prev.filter((tab) => tab !== value)
        : [...prev, value],
    );
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
      [...(coordResult ? [coordResult] : []), ...allResults],
      hoveredResult,
      selectedResult,
      handleSearchClick,
    );
  }, [
    allResults,
    coordResult,
    hoveredResult,
    selectedResult,
    handleSearchClick,
  ]);

  if (allResults.length === 0 && coordResult == null) {
    if (searchQuery !== '') {
      return (
        <Box p={4} bg="white" borderRadius={'16px'} w="100%">
          {t('search.noResults')}
        </Box>
      );
    } else {
      return null;
    }
  }

  return (
    <Stack
      gap={0}
      p={4}
      bg="white"
      borderRadius={'16px'}
      maxH={'100%'}
      overflowY={'auto'}
      display={'flex'}
      maxWidth={'450px'}
    >
      <Box overflowY="auto" overflowX="hidden" minHeight="0px">
        <AccordionRoot
          collapsible
          multiple
          value={accordionTabsOpen}
          backgroundColor="white"
          mt="5px"
          borderRadius={10}
          variant={'plain'}
        >
          {coordResult != null ? (
            <CoordinateResults
              coordinateResult={coordResult}
              setSelectedResult={handleSearchClick}
              handleHover={handleHover}
              setHoveredResult={setHoveredResult}
            />
          ) : (
            <>
              <AddressesResults
                handleSearchClick={handleSearchClick}
                handleHover={handleHover}
                setHoveredResult={setHoveredResult}
                onTabClick={() => handleAccordionTabClick('addresses')}
              />
              <PlacesResult
                handleSearchClick={handleSearchClick}
                handleHover={handleHover}
                setHoveredResult={setHoveredResult}
                onTabClick={() => handleAccordionTabClick('places')}
              />
              <RoadsResults
                handleSearchClick={handleSearchClick}
                handleHover={handleHover}
                setHoveredResult={setHoveredResult}
                onTabClick={() => handleAccordionTabClick('roads')}
              />
              <PropertiesResults
                handleSearchClick={handleSearchClick}
                handleHover={handleHover}
                setHoveredResult={setHoveredResult}
                onTabClick={() => handleAccordionTabClick('properties')}
              />
            </>
          )}
        </AccordionRoot>
      </Box>
    </Stack>
  );
};
