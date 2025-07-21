import { Box, Flex, Icon, Image, Search } from '@kvib/react';
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
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();

  const { placeNameData } = usePlaceNames(searchQuery, placesPage);
  const { roadsData } = useRoads(searchQuery);
  const { propertiesData } = useProperties(searchQuery);
  const { addressData } = useAddresses(searchQuery);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  return (
    <Flex flexDir="column" alignItems="stretch" gap={4} p={4}>
      <Box position="relative" width="100%">
        <Box position="relative" width="90%">
          {/* Logo som absolutt posisjonert inni Search-feltet */}
          <Box
            position="absolute"
            left="10px"
            top="50%"
            transform="translateY(-50%)"
            pointerEvents="none"
            zIndex={2}
            height="24px"
            width="auto"
          >
            <Image
              src="/logos/KV_logo_staa_color.svg"
              alt="Kartverket"
              height="24px"
              width="auto"
              objectFit="contain"
            />
          </Box>

          <Search
            width="100%"
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{ paddingLeft: '50px' }}
            height="45px"
            fontSize="1.1rem"
            bg="white"
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
