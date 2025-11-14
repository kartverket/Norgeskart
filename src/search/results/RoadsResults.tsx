import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Box,
  List,
  ListItem,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchResult } from '../../types/searchTypes';
import { roadResultsAtom } from '../atoms';
import { getAddresses } from '../searchApi';
import { SearchResultLine } from './SearchResultLine';

interface RoadsResultsProps {
  handleSearchClick: (res: SearchResult) => void;
  handleHover: (res: SearchResult) => void;
  setHoveredResult: (res: SearchResult | null) => void;
  onTabClick: () => void;
}

export const RoadsResults = ({
  handleSearchClick,
  handleHover,
  setHoveredResult,
  onTabClick,
}: RoadsResultsProps) => {
  const { t } = useTranslation();
  const roads = useAtomValue(roadResultsAtom);

  const [openRoads, setOpenRoads] = useState<string[]>([]);

  const toggleRoad = (roadId: string) => {
    setOpenRoads((prev) =>
      prev.includes(roadId)
        ? prev.filter((id) => id !== roadId)
        : [...prev, roadId],
    );
  };

  const handleHouseNumberClick = async (
    roadName: string,
    houseNumber: string,
  ) => {
    try {
      const query = `${roadName} ${houseNumber}`;
      const response = await getAddresses(query);

      const address = response.adresser?.[0];
      if (!address) return;

      handleSearchClick({
        type: 'Address',
        name: address.adressenavn,
        lat: address.representasjonspunkt.lat,
        lon: address.representasjonspunkt.lon,
        address,
      });
    } catch (e) {
      console.error('Failed to fetch address', e);
    }
  };

  if (roads.length === 0) {
    return null;
  }

  return (
    <AccordionItem value="roads">
      <AccordionItemTrigger onClick={onTabClick}>
        {t('search.roads')} ({roads.length})
      </AccordionItemTrigger>
      <AccordionItemContent>
        <List>
          {roads.map((road, i) => (
            <Box key={`road-${i}`}>
              <SearchResultLine
                heading={road.NAVN}
                showButton={true}
                onButtonClick={() => toggleRoad(road.ID)}
                onClick={() =>
                  handleSearchClick({
                    type: 'Road',
                    name: road.NAVN,
                    lat: parseFloat(road.LATITUDE),
                    lon: parseFloat(road.LONGITUDE),
                    road,
                  })
                }
                onMouseEnter={() =>
                  handleHover({
                    type: 'Road',
                    name: road.NAVN,
                    lat: parseFloat(road.LATITUDE),
                    lon: parseFloat(road.LONGITUDE),
                    road,
                  })
                }
                onMouseLeave={() => setHoveredResult(null)}
              />
              {openRoads.includes(road.ID) && road.HUSNUMMER && (
                <List ml="20px">
                  {road.HUSNUMMER.map((houseNumber, i) => (
                    <ListItem
                      _hover={{ fontWeight: '600' }}
                      cursor="pointer"
                      as={'ul'}
                      key={`houseNumber-${i}`}
                      mb={2}
                      onClick={() =>
                        handleHouseNumberClick(road.NAVN, houseNumber)
                      }
                    >
                      {t('search.houseNumber')}
                      <Box as="span" ml={5}>
                        {houseNumber}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          ))}
        </List>
      </AccordionItemContent>
    </AccordionItem>
  );
};
