import {
  Box,
  Heading,
  List,
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
  Separator,
} from '@kvib/react';
import { Eiendom, StedsnavnApiResponse, Veg } from '../types/searchTypes.ts';

interface SearchResultsProps {
  placeNameData?: StedsnavnApiResponse;
  roadsData?: Veg[];
  propertiesData?: Eiendom[];
  currentPage: number;
  totalResults: number;
  resultsPerPage: number;
  handlePageChange: (newPage: number) => void;
}

export const SearchResults = ({
  placeNameData,
  roadsData,
  propertiesData,
  currentPage,
  totalResults,
  resultsPerPage,
  handlePageChange,
}: SearchResultsProps) => {
  return (
    <Box backgroundColor="white" mt="5px" overflowY="scroll" maxH="1000px">
      {placeNameData && (
        <>
          <List listStyleType="none">
            <Heading padding="10px" size="md" backgroundColor="gray.100">
              STEDSNAVN
            </Heading>
            {placeNameData.navn.map((place, index) => (
              <Box padding="5px" key={index}>
                <li>
                  {place.skrivemåte}, {place.navneobjekttype}{' '}
                  {place.kommuner ? 'i ' + place.kommuner[0].kommunenavn : null}
                  <Separator />
                </li>
              </Box>
            ))}
          </List>
          <PaginationRoot
            count={totalResults}
            pageSize={resultsPerPage}
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
          {roadsData.map((road) => (
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
          {propertiesData.map((property) => (
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
  );
};
