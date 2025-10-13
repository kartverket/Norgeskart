import { AccordionRoot } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { mapAtom } from '../../map/atoms.ts';
import { useMapSettings } from '../../map/mapHooks.ts';
import { useIsMobileScreen } from '../../shared/hooks.ts';
import { getInputCRS } from '../../shared/utils/crsUtils.ts';
import {
  Address,
  Metadata,
  PlaceName,
  Property,
  Road,
  SearchResult,
} from '../../types/searchTypes.ts';
import { InfoBox } from '../infobox/InfoBox.tsx';
import { updateSearchMarkers } from '../searchmarkers/updateSearchMarkers.ts';
import { AddressesResults } from './AddressesResults.tsx';
import { PlacesResult } from './PlacesResults.tsx';
import { PropertiesResults } from './PropertiesResults.tsx';
import { RoadsResults } from './RoadsResults.tsx';
import { searchResultsMapper } from './searchresultsMapper.ts';

type AccordionTab = 'places' | 'roads' | 'properties' | 'addresses';

interface SearchResultsProps {
  properties: Property[];
  roads: Road[];
  places: PlaceName[];
  addresses: Address[];
  placesMetadata?: Metadata;
  onPlacesPageChange: (_page: number) => void;
  searchQuery: string;
  selectedResult: SearchResult | null;
  setSelectedResult: (result: SearchResult | null) => void;
  hoveredResult: SearchResult | null;
  setHoveredResult: (result: SearchResult | null) => void;
}

export const SearchResults = ({
  properties,
  roads,
  places,
  addresses,
  placesMetadata,
  onPlacesPageChange,
  setSelectedResult,
  selectedResult,
  hoveredResult,
  setHoveredResult,
}: SearchResultsProps) => {
  const map = useAtomValue(mapAtom);
  const isMobileScreen = useIsMobileScreen();
  const { setMapLocation } = useMapSettings();
  const [accordionTabsOpen, setAccordionTabsOpen] = useState<AccordionTab[]>([
    'places',
    'roads',
    'properties',
    'addresses',
  ]);
  const allResults = searchResultsMapper(places, roads, addresses, properties);

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

  const hasResults = allResults.length > 0;

  if (!placesMetadata) {
    return null;
  }

  if (selectedResult) {
    return <InfoBox result={selectedResult} />;
  }

  return (
    <AccordionRoot
      collapsible
      multiple
      value={accordionTabsOpen}
      backgroundColor="white"
      mt="5px"
      overflowY="auto"
      height={
        hasResults ? (isMobileScreen ? '10vh' : 'calc(100vh - 130px)') : 'auto'
      }
      maxHeight={
        hasResults ? (isMobileScreen ? '10vh' : 'calc(100vh - 130px)') : 'none'
      }
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
  );
};
