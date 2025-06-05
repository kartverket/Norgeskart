import { Box, List, ListItem, Separator, Text } from '@kvib/react';
import { useSetAtom } from 'jotai';
import { SearchResult, selectedSearchResultAtom } from './atoms.ts';

interface SearchResultsProps {
  results: SearchResult[];
  currentPage: number;
  totalResults: number;
  resultsPerPage: number;
}

export const SearchResults = ({ results }: SearchResultsProps) => {
  const setSelectedSearchResult = useSetAtom(selectedSearchResultAtom);

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
            <ListItem
              key={i}
              cursor="pointer"
              _hover={{ bg: 'gray.100' }}
              onClick={() => setSelectedSearchResult(res)}
            >
              {res.type === 'Place' && (
                <Text>
                  {res.place.skrivemåte}, {res.place.navneobjekttype}
                </Text>
              )}
              {res.type === 'Road' && (
                <Text>
                  {res.road.NAVN}, {res.road.KOMMUNENAVN}
                </Text>
              )}
              {res.type === 'Property' && (
                <Text>
                  {res.property.TITTEL}, {res.property.KOMMUNENAVN}
                </Text>
              )}
              {res.type === 'Address' && (
                <Text>
                  {res.address.adressenavn}, {res.address.adressetekst}
                </Text>
              )}
              <Separator />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
