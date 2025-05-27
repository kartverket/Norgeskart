import { Search } from '@kvib/react';
import { useState } from 'react';
import { SearchResult, SearchResultType } from './atoms.ts';
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

  const totalResults = placeNameData?.metadata?.totaltAntallTreff || 0;
  const resultsPerPage = 15;

  const combinedResults: SearchResult[] = [
    ...(placeNameData?.navn.map(
      (place): SearchResult => ({
        type: SearchResultType.Place,
        name: place.skrivemåte,
        lat: place.representasjonspunkt.øst,
        lon: place.representasjonspunkt.nord,
        place: place,
      }),
    ) || []),
    ...(roadsData?.map(
      (road): SearchResult => ({
        type: SearchResultType.Road,
        name: road.NAVN,
        lat: parseFloat(road.LATITUDE),
        lon: parseFloat(road.LONGITUDE),
        road: road,
      }),
    ) || []),
    ...(propertiesData?.map(
      (property): SearchResult => ({
        type: SearchResultType.Property,
        name: property.NAVN,
        lat: parseFloat(property.LATITUDE),
        lon: parseFloat(property.LONGITUDE),
        property: property,
      }),
    ) || []),
    ...(addressData?.adresser.map(
      (address): SearchResult => ({
        type: SearchResultType.Address,
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
        width="430px"
        backgroundColor="white"
        placeholder="Søk i Norgeskart"
        size="lg"
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
