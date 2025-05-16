import { Box, Search } from '@kvib/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getSearchResults } from '../api/searchApi.ts';

export const SearchComponent = () => {
  const [searchQuery,setSearchQuery] = useState('')

  const { data, error, isLoading } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => getSearchResults(searchQuery),
    enabled: !!searchQuery
    }
  );

  return (
    <>
      <Search
        backgroundColor="white"
        placeholder="Søk i Norgeskart"
        size="lg"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <Box backgroundColor="white">
      {isLoading && <p>Loading...</p>}
      {error && <p>{error.message}</p>}
      {data && (
        <>
        <ul>
          <p>Adresser</p>
          {data.addresses.adresser.map((address, index) => (
            <li key={index}>{address.adressenavn}</li>
          ))}
        </ul>
          <ul>
            <p>Stedsnavn</p>
            {data.placeNames.navn.map((placeName, index) => (
              <li key={index}>{placeName.skrivemåte}, {placeName.navneobjekttype}</li>
            ))}
          </ul>

        </>
      )}
      </Box>
    </>
  );
};
