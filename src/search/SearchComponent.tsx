import { Box, Flex, Icon, Search } from '@kvib/react';
import { useCallback, useState } from 'react';
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
  const { t } = useTranslation();

  const { placeNameData } = usePlaceNames(searchQuery, placesPage);
  const { roadsData } = useRoads(searchQuery);
  const { propertiesData } = useProperties(searchQuery);
  const { addressData } = useAddresses(searchQuery);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <Flex flexDir="column" alignItems="stretch" gap={4} p={4}>
      <Box position="relative" width="100%">
        <Box position="relative" width="90%">
          {/* Logo som absolutt posisjonert inni Search-feltet */}

          <Search
            width="100%"
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={handleChange}
            height="45px"
            fontSize="1.1rem"
            bg="white"
          />
          <Box
            position="absolute"
            right="10px"
            top="50%"
            transform="translateY(-50%)"
            pointerEvents="none"
          >
            <Icon icon="search" size={24} weight={500} color="green" />
          </Box>
        </Box>
      </Box>

      <SearchResults
        properties={propertiesData ? propertiesData : []}
        roads={roadsData ? roadsData : []}
        places={placeNameData ? placeNameData.navn : []}
        addresses={addressData ? addressData.adresser : []}
        placesMetadata={placeNameData?.metadata}
        onPlacesPageChange={(page: number) => {
          setPlacesPage(page);
        }}
        searchQuery={searchQuery}
      />
    </Flex>
  );
};
