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
import { usePlaceNames, useProperties, useRoads } from './useSearchQueries.ts';

export const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { placeNameData } = usePlaceNames(searchQuery, currentPage);
  const { roadsData } = useRoads(searchQuery);
  const { propertiesData } = useProperties(searchQuery);

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

      <Box backgroundColor="white" mt="5px" overflowY="scroll" maxH="1000px">
        {placeNameData && (
          <>
            <List listStyleType="none">
              <Heading padding="10px" size="md" backgroundColor="gray.100">
                STEDSNAVN
              </Heading>
              {placeNameData?.navn.map((place, index) => (
                <Box padding="5px" key={index}>
                  <li>
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

        {roadsData && roadsData.length > 0 && (
          <List listStyleType="none">
            <Heading padding="10px" size="md" backgroundColor="gray.100">
              VEGER
            </Heading>
            {roadsData?.map((road) => (
              <Box padding="5px" key={road.ID}>
                <li>
                  {road.NAVN}, {road.KOMMUNENAVN}
                </li>
                <Separator />
              </Box>
            ))}
          </List>
        )}
        {propertiesData && propertiesData.length > 0 && (
          <List listStyleType="none">
            <Heading padding="10px" size="md" backgroundColor="gray.100">
              EIENDOMMER
            </Heading>
            {propertiesData?.map((property) => (
              <Box padding="5px" key={property.ID}>
                <li>
                  {property.TITTEL}, {property.KOMMUNENAVN}
                </li>
                <Separator />
              </Box>
            ))}
          </List>
        )}
      </Box>
    </>
  );
};
