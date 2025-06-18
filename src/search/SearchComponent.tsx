import { Box, Flex, Icon, Search } from '@kvib/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchResults } from './results/SearchResults.tsx';
import {
  useAddresses,
  usePlaceNames,
  useProperties,
  useRoads,
} from './useSearchQueries.ts';

export const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [placesPage, setPlacesPage] = useState(1);
  const [isFocused, setIsFocused] = useState(false);

  const { placeNameData } = usePlaceNames(searchQuery, placesPage);
  const { roadsData } = useRoads(searchQuery);
  const { propertiesData } = useProperties(searchQuery);
  const { addressData } = useAddresses(searchQuery);
  const { t } = useTranslation();

  return (
    <Flex flexDir="column" alignItems="stretch" gap={4} p={4}>
 
     <Box position="relative" width="100%">
        <Search
          width="100%"
          placeholder={t('search.placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
        {!isFocused && (
          <Box
            position="absolute"
            right="10px"
            top="50%"
            transform="translateY(-50%)"
            pointerEvents="none"
          >
            <Icon icon="search" size={24} weight={500} color="green" />
          </Box>
        )}
      </Box>
      <SearchResults
        properties={propertiesData ? propertiesData : []}
        roads={roadsData ? roadsData : []}
        places={placeNameData ? placeNameData.navn : []}
        addresses={addressData ? addressData.adresser : []}
        placesMetadata={placeNameData?.metadata}
        onPlacesPageChange={setPlacesPage}
      />
    </Flex>
  );
};
