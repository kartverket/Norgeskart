import {
  Box,
  Heading,
  List,
  ListItem,
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
  Separator,
} from '@kvib/react';
import {
  AddressApiResponse,
  PlaceNameApiResponse,
  Property,
  Road,
} from '../types/searchTypes.ts';

interface SearchResultsProps {
  placeNameData?: PlaceNameApiResponse;
  roadsData?: Road[];
  propertiesData?: Property[];
  addressData?: AddressApiResponse;
  currentPage: number;
  totalResults: number;
  resultsPerPage: number;
  handlePageChange: (newPage: number) => void;
}

export const SearchResults = ({
  placeNameData,
  roadsData,
  propertiesData,
  addressData,
  currentPage,
  totalResults,
  resultsPerPage,
  handlePageChange,
}: SearchResultsProps) => {
  return (
    <Box
      backgroundColor="white"
      mt="5px"
      overflowY="scroll"
      maxH="1000px"
      width="450px"
    >
      {placeNameData && placeNameData.navn.length > 0 && (
        <>
          <List listStyleType="none">
            <Heading padding="10px" size="md" backgroundColor="gray.100">
              STEDSNAVN
            </Heading>
            {placeNameData.navn.map((place, index) => (
              <ListItem padding="5px" key={index}>
                {place.skrivemåte}, {place.navneobjekttype}{' '}
                {place.kommuner ? 'i ' + place.kommuner[0].kommunenavn : null}
                <Separator />
              </ListItem>
            ))}
          </List>
          {/*Pagineringen er ikke helt bra*/}
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
        <List listStyleType="none" mt="5px">
          <Heading padding="10px" size="md" backgroundColor="gray.100">
            VEGER
          </Heading>
          {roadsData.map((road, index) => (
            <ListItem padding="5px" key={index}>
              {road.NAVN}, {road.KOMMUNENAVN}
              <Separator />
            </ListItem>
          ))}
        </List>
      )}
      {propertiesData && propertiesData.length > 0 && (
        <List listStyleType="none" mt="5px">
          <Heading padding="10px" size="md" backgroundColor="gray.100">
            EIENDOMMER
          </Heading>
          {propertiesData.map((property, index) => (
            <ListItem padding="5px" key={index}>
              {property.TITTEL}, {property.KOMMUNENAVN}
            </ListItem>
          ))}
        </List>
      )}
      {addressData && addressData.adresser.length > 0 && (
        <List listStyleType="none" mt="5px">
          <Heading padding="10px" size="md" backgroundColor="gray.100">
            ADRESSER
          </Heading>
          {addressData.adresser.map((address, index) => (
            <ListItem padding="5px" key={index}>
              {address.adressenavn}, {address.adressetekst}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};
