import { Flex, Search } from '@kvib/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const [placesPage, setPlacesPage] = useState(1);

  const { placeNameData } = usePlaceNames(searchQuery, placesPage);
  const { roadsData } = useRoads(searchQuery);
  const { propertiesData } = useProperties(searchQuery);
  const { addressData } = useAddresses(searchQuery);
  const isMobileScreen = useIsMobileScreen();
  const { t } = useTranslation();

  return (
    <Flex
      flexDir={isMobileScreen ? 'row' : 'column'}
      alignItems="flex-start"
      gap={4}
      p={4}
    >
      <Search
        width={isMobileScreen ? '75%' : '100%'}
        placeholder={t('search.placeholder')}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setPlacesPage(1);
        }}
      />
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
