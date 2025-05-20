import {
  Box,
  Heading,
  List,
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
  Search,
  Separator,
} from '@kvib/react';
import { useState } from 'react';
import { useAddresses, usePlaceNames } from './useSearchQueries.ts';

export const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: addressData,
    isLoading: addressLoading,
    error: addressError,
  } = useAddresses(searchQuery);

  const {
    data: placeNameData,
    isLoading: placeNameLoading,
    error: placeNameError,
  } = usePlaceNames(searchQuery, currentPage);

  const isLoading = addressLoading || placeNameLoading;
  const hasError = addressError || placeNameError;

  const totalResults = placeNameData?.metadata?.totaltAntallTreff || 0;
  const treffPerSide = 15;

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
        backgroundColor="white"
        placeholder="Søk i Norgeskart"
        size="lg"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <Box backgroundColor="white" mt="5px">
        {isLoading && <p>Laster...</p>}
        {hasError && <p>En feil oppstod ved søk.</p>}

        {/*Resultater fra søk bør kanskje i egen fil etter hvert*/}
        {placeNameData && (
          <>
            <List listStyleType="none">
              <Heading padding="10px" size="md" backgroundColor="gray.100">
                STEDSNAVN
              </Heading>
              {placeNameData?.navn.map((place, index) => (
                <Box padding="5px">
                  <li key={index} onClick={() => console.log('Klikk!!!!')}>
                    {place.skrivemåte}, {place.navneobjekttype}{' '}
                    {place.kommuner
                      ? 'i ' + place.kommuner[0].kommunenavn
                      : null}
                    <Separator />
                  </li>
                </Box>
              ))}
            </List>
            <PaginationRoot
              count={totalResults}
              pageSize={treffPerSide}
              page={currentPage}
              onPageChange={(e) => handlePageChange(e.page)}
            >
              <PaginationPrevTrigger />
              <PaginationItems />
              <PaginationNextTrigger />
            </PaginationRoot>
          </>
        )}

        {/*Hvis det er vegnavn som dukker opp skal det under "VEGER"?? HMM. skjønner ikke helt */}
        {/*Eiendommer, også fra adressesøk? hmmm*/}

        {/*{addressData && (*/}
        {/*    <List listStyleType="none">*/}
        {/*      <Heading size="md" backgroundColor="gray.100">VEG</Heading>*/}
        {/*      {addressData?.adresser.map((address, index) => (*/}
        {/*        <li key={index}>{address.adressenavn}, {address.kommunenavn}</li>*/}
        {/*      ))}*/}
        {/*    </List>*/}
        {/*)}*/}
      </Box>
    </>
  );
};
