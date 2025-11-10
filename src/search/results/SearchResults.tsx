import { AccordionRoot, Box, Stack } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { mapAtom } from '../../map/atoms.ts';
import { useMapSettings } from '../../map/mapHooks.ts';
import { getInputCRS } from '../../shared/utils/crsUtils.ts';
import { SearchResult } from '../../types/searchTypes.ts';
import {
  addressResultsAtom,
  placeNameMetedataAtom,
  placeNameResultsAtom,
  propertyResultsAtom,
  roadResultsAtom,
  searchResultsAtom,
} from '../atoms.ts';
import { updateSearchMarkers } from '../searchmarkers/updateSearchMarkers.ts';
import { AddressesResults } from './AddressesResults.tsx';
import { PlacesResult } from './PlacesResults.tsx';
import { PropertiesResults } from './PropertiesResults.tsx';
import { RoadsResults } from './RoadsResults.tsx';

type AccordionTab = 'places' | 'roads' | 'properties' | 'addresses';

interface SearchResultsProps {
  onPlacesPageChange: (_page: number) => void;
  searchQuery: string;
  selectedResult: SearchResult | null;
  setSelectedResult: (result: SearchResult | null) => void;
  hoveredResult: SearchResult | null;
  setHoveredResult: (result: SearchResult | null) => void;
}

export const SearchResults = ({
  onPlacesPageChange,
  setSelectedResult,
  selectedResult,
  hoveredResult,
  setHoveredResult,
}: SearchResultsProps) => {
  const map = useAtomValue(mapAtom);
  const { setMapLocation } = useMapSettings();
  const [accordionTabsOpen, setAccordionTabsOpen] = useState<AccordionTab[]>([
    'places',
    'roads',
    'properties',
    'addresses',
  ]);

  const properties = useAtomValue(propertyResultsAtom);
  const roads = useAtomValue(roadResultsAtom);
  const places = useAtomValue(placeNameResultsAtom);
  const placesMetadata = useAtomValue(placeNameMetedataAtom);
  const addresses = useAtomValue(addressResultsAtom);
  const allResults = useAtomValue(searchResultsAtom);

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
      map,
      allResults,
      hoveredResult,
      selectedResult,
      handleSearchClick,
    );
  }, [map, allResults, hoveredResult, selectedResult, handleSearchClick]);

  if (!placesMetadata) {
    return null;
  }

  return (
    <Stack p={4} borderRadius={'16px'} bg="white">
      <Box overflowY="auto" overflowX="hidden" maxHeight="60vh">
        <AccordionRoot
          collapsible
          multiple
          value={accordionTabsOpen}
          backgroundColor="white"
          mt="5px"
          borderRadius={10}
        >
          <PlacesResult
            places={places}
            placesMetadata={placesMetadata}
            onPlacesPageChange={onPlacesPageChange}
            handleSearchClick={handleSearchClick}
            handleHover={handleHover}
            setHoveredResult={setHoveredResult}
            onTabClick={() => handleAccordionTabClick('places')}
          />
          <RoadsResults
            roads={roads}
            handleSearchClick={handleSearchClick}
            handleHover={handleHover}
            setHoveredResult={setHoveredResult}
            onTabClick={() => handleAccordionTabClick('roads')}
          />
          <PropertiesResults
            properties={properties}
            handleSearchClick={handleSearchClick}
            handleHover={handleHover}
            setHoveredResult={setHoveredResult}
            onTabClick={() => handleAccordionTabClick('properties')}
          />
          <AddressesResults
            addresses={addresses}
            handleSearchClick={handleSearchClick}
            handleHover={handleHover}
            setHoveredResult={setHoveredResult}
            onTabClick={() => handleAccordionTabClick('addresses')}
          />
        </AccordionRoot>
      </Box>
    </Stack>
  );
};
