import { Search } from '@kvib/react';
import { useState } from 'react';
import { SearchResults } from './SearchResults.tsx';
import {
  useAddresses,
  usePlaceNames,
  useProperties,
  useRoads,
} from './useSearchQueries.ts';

export const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { placeNameData } = usePlaceNames(searchQuery, currentPage);
  const { roadsData } = useRoads(searchQuery);
  const { propertiesData } = useProperties(searchQuery);
  const { addressData } = useAddresses(searchQuery);

  const totalResults = placeNameData?.metadata?.totaltAntallTreff || 0;
  const resultsPerPage = 15;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <>
      <Search
        width="430px"
        backgroundColor="white"
        placeholder="Søk i Norgeskart"
        size="lg"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <SearchResults
        placeNameData={placeNameData}
        roadsData={roadsData}
        propertiesData={propertiesData}
        addressData={addressData}
        currentPage={currentPage}
        totalResults={totalResults}
        resultsPerPage={resultsPerPage}
        handlePageChange={handlePageChange}
      />
    </>
  );
};
