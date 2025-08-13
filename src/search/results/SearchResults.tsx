import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
  List,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { addSearchMarkers } from '../searchMarkers.ts';
import { PlacesResult } from './PlacesResults.tsx';
import { RoadsResults } from './RoadsResults.tsx';
import { SearchResultLine } from './SearchResultLine.tsx';
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
}

export const SearchResults = ({
  properties,
  roads,
  places,
  addresses,
  placesMetadata,
  onPlacesPageChange,
  searchQuery,
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
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null,
  );
  const [hoveredResult, setHoveredResult] = useState<SearchResult | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setSelectedResult(null);
    setHoveredResult(null);
  }, [searchQuery]);

  const allResults = searchResultsMapper(places, roads, addresses, properties);

  useEffect(() => {
    addSearchMarkers(map, allResults, hoveredResult, selectedResult);
  }, [map, allResults, hoveredResult, selectedResult]);

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

  const handleSearchClick = (res: SearchResult) => {
    const { lon, lat } = res;
    setSelectedResult(res);
    setMapLocation([lon, lat], getInputCRS(res), 15);
  };

  //Mattis 18.06.26. For å sjekke om det er resultater for høydesetting på resultatene
  const hasResults =
    properties.length > 0 ||
    roads.length > 0 ||
    places.length > 0 ||
    addresses.length > 0;

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
      />
      <RoadsResults
        roads={roads}
        handleSearchClick={handleSearchClick}
        handleHover={handleHover}
        setHoveredResult={setHoveredResult}
      />
      {properties.length > 0 && (
        <AccordionItem value="properties">
          <AccordionItemTrigger
            onClick={() => handleAccordionTabClick('properties')}
          >
            {t('search.properties')} ({properties.length})
          </AccordionItemTrigger>
          <AccordionItemContent>
            <List>
              {properties.map((property, i) => (
                <SearchResultLine
                  key={`property-${i}`}
                  heading={property.TITTEL}
                  onClick={() =>
                    handleSearchClick({
                      type: 'Property',
                      name: property.TITTEL,
                      lat: parseFloat(property.LATITUDE),
                      lon: parseFloat(property.LONGITUDE),
                      property,
                    })
                  }
                  onMouseEnter={() =>
                    handleHover({
                      type: 'Property',
                      name: property.TITTEL,
                      lat: parseFloat(property.LATITUDE),
                      lon: parseFloat(property.LONGITUDE),
                      property,
                    })
                  }
                  onMouseLeave={() => setHoveredResult(null)}
                  locationType={property.KOMMUNENAVN}
                />
              ))}
            </List>
          </AccordionItemContent>
        </AccordionItem>
      )}
      {addresses.length > 0 && (
        <AccordionItem value="addresses">
          <AccordionItemTrigger
            onClick={() => handleAccordionTabClick('addresses')}
          >
            {t('search.addresses')} ({addresses.length})
          </AccordionItemTrigger>
          <AccordionItemContent>
            <List>
              {addresses.map((address, i) => (
                <SearchResultLine
                  key={`address-${i}`}
                  heading={`${address.adressenavn}, ${address.adressetekst}`}
                  onClick={() =>
                    handleSearchClick({
                      type: 'Address',
                      name: address.adressenavn,
                      lat: address.representasjonspunkt.lat,
                      lon: address.representasjonspunkt.lon,
                      address,
                    })
                  }
                  onMouseEnter={() =>
                    handleHover({
                      type: 'Address',
                      name: address.adressenavn,
                      lat: address.representasjonspunkt.lat,
                      lon: address.representasjonspunkt.lon,
                      address,
                    })
                  }
                  onMouseLeave={() => setHoveredResult(null)}
                />
              ))}
            </List>
          </AccordionItemContent>
        </AccordionItem>
      )}
    </AccordionRoot>
  );
};
