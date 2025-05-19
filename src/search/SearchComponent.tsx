import { Box, Search } from '@kvib/react';
import { useState } from 'react';
import { useAddresses, usePlaceNames } from './useSearchQueries.ts';

export const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: addressData,
    isLoading: addressLoading,
    error: addressError,
  } = useAddresses(searchQuery);

  const {
    data: placeData,
    isLoading: placeLoading,
    error: placeError,
  } = usePlaceNames(searchQuery);

  const isLoading = addressLoading || placeLoading;
  const hasError = addressError || placeError;

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
        {isLoading && <p>Laster...</p>}
        {hasError && <p>En feil oppstod ved søk.</p>}

        {placeData ? (
          <ul>
            <p>STEDSNAVN</p>
            {placeData?.navn.map((place, index) => (
              <li key={index}>
                {place.skrivemåte}, {place.navneobjekttype}{' '}
                {place.kommuner ? 'i ' + place.kommuner[0].kommunenavn : null}
              </li>
            ))}
          </ul>
        ) : null}

        {addressData ? (
          <>
            <ul>
              <p>VEG</p>
              {addressData?.adresser.map((address, index) => (
                <li key={index}>{address.adressenavn}</li>
              ))}
            </ul>
          </>
        ) : null}
      </Box>
    </>
  );
};
