import { Flex, Search } from '@kvib/react';
import { useState } from 'react';
import { useIsMobileScreen } from '../shared/hooks.ts';
import { SearchResults } from './results/SearchResults.tsx';
import {
  useAddresses,
  usePlaceNames,
  useProperties,
  useRoads,
} from './useSearchQueries.ts';

export const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { placeNameData } = usePlaceNames(searchQuery, 1);
  const { roadsData } = useRoads(searchQuery);
  const { propertiesData } = useProperties(searchQuery);
  const { addressData } = useAddresses(searchQuery);
  const isMobileScreen = useIsMobileScreen();

  return (
    <Flex
      flexDir={isMobileScreen ? 'row' : 'column'}
      alignItems="flex-start"
      gap={4}
      p={4}
    >
      <Search
        width={isMobileScreen ? '75%' : '100%'}
        placeholder="Søk i Norgeskart"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <SearchResults
        poperties={propertiesData ? propertiesData : []}
        roads={roadsData ? roadsData : []}
        places={placeNameData ? placeNameData.navn : []}
        addresses={addressData ? addressData.adresser : []}
      />
    </Flex>
  );
};
