import { Search } from '@kvib/react';
import { useState } from 'react';
import { useSelectedSearchResult } from '../map/mapHooks.ts';
import { SearchResult } from './atoms.ts';
import { SearchResults } from './SearchResults.tsx';
import {
  useAddresses,
  usePlaceNames,
  useProperties,
  useRoads,
} from './useSearchQueries.ts';

export const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const currentPage = 1;

  const { placeNameData } = usePlaceNames(searchQuery, currentPage);
  const { roadsData } = useRoads(searchQuery);
  const { propertiesData } = useProperties(searchQuery);
  const { addressData } = useAddresses(searchQuery);

  useSelectedSearchResult();

  //Til pagineringen som skal med etter hvert. kanskje
  const totalResults = placeNameData?.metadata?.totaltAntallTreff || 0;
  const resultsPerPage = 15;

  const combinedResults: SearchResult[] = [
    ...(placeNameData?.navn.map(
      (place): SearchResult => ({
        type: 'Place',
        name: place.skrivemåte,
        lon: place.representasjonspunkt.øst,
        lat: place.representasjonspunkt.nord,
        place: place,
      }),
    ) || []),
    ...(roadsData?.map(
      (road): SearchResult => ({
        type: 'Road',
        name: road.NAVN,
        lat: parseFloat(road.LATITUDE),
        lon: parseFloat(road.LONGITUDE),
        road: road,
      }),
    ) || []),
    ...(propertiesData?.map(
      (property): SearchResult => ({
        type: 'Property',
        name: property.NAVN,
        lat: parseFloat(property.LATITUDE),
        lon: parseFloat(property.LONGITUDE),
        property: property,
      }),
    ) || []),
    ...(addressData?.adresser.map(
      (address): SearchResult => ({
        type: 'Address',
        name: address.adressetekst,
        lat: address.representasjonspunkt.lat,
        lon: address.representasjonspunkt.lon,
        address: address,
      }),
    ) || []),
  ];

  return (
    <>
      <Search
        width="100%"
        placeholder="Søk i Norgeskart"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <SearchResults
        results={combinedResults}
        currentPage={currentPage}
        totalResults={totalResults}
        resultsPerPage={resultsPerPage}
      />
    </>
  );
};
