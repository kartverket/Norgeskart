import { Box, List, ListItem, Text } from '@kvib/react';
import { SearchResult, SearchResultType } from './atoms.ts';

interface SearchResultsProps {
  results: SearchResult[];
  currentPage: number;
  totalResults: number;
  resultsPerPage: number;
  handlePageChange: (newPage: number) => void;
}

export const SearchResults = ({ results }: SearchResultsProps) => {
  return (
    <Box
      backgroundColor="white"
      mt="5px"
      overflowY="scroll"
      maxH="1000px"
      width="450px"
    >
      <List listStyleType="none">
        {results.map((res, i) => {
          return (
            <ListItem key={i}>
              {res.type === SearchResultType.Place && (
                <Text>
                  {res.place.skrivemåte}, {res.place.navneobjekttype}
                </Text>
              )}
              {res.type === SearchResultType.Road && (
                <Text>
                  {res.road.NAVN}, {res.road.KOMMUNENAVN}
                </Text>
              )}
              {res.type === SearchResultType.Property && (
                <Text>
                  {res.property.TITTEL}, {res.property.KOMMUNENAVN}
                </Text>
              )}
              {res.type === SearchResultType.Address && (
                <Text>
                  {res.address.adressenavn}, {res.address.adressetekst}
                </Text>
              )}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
