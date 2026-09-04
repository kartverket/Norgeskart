import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  List,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { SearchResult } from '../../types/searchTypes';
import { polarPlaceNameResultsAtom } from '../atoms';
import { SearchResultLine } from './SearchResultLine';

interface PolarPlacesResultProps {
  handleSearchClick: (res: SearchResult) => void;
  handleHover: (res: SearchResult) => void;
  setHoveredResult: (res: SearchResult | null) => void;
  onTabClick: () => void;
}

export const PolarPlacesResult = ({
  handleSearchClick,
  handleHover,
  setHoveredResult,
  onTabClick,
}: PolarPlacesResultProps) => {
  const polarPlaces = useAtomValue(polarPlaceNameResultsAtom);
  return (
    <AccordionItem value="polarPlaces">
      <AccordionItemTrigger onClick={onTabClick}>
        Stedsnavn (Norske polarområder)
      </AccordionItemTrigger>

      <AccordionItemContent>
        <List>
          {polarPlaces.map((polarPlace, i) => (
            <SearchResultLine
              key={`polar-${i}`}
              heading={polarPlace.title}
              onClick={() => {
                handleSearchClick({
                  type: 'PolarPlace',
                  name: polarPlace.title,
                  lat: polarPlace.geometry.coordinates[1],
                  lon: polarPlace.geometry.coordinates[0],
                  polarPlace,
                });
              }}
              onMouseEnter={() =>
                handleHover({
                  type: 'PolarPlace',
                  name: polarPlace.title,
                  lat: polarPlace.geometry.coordinates[1],
                  lon: polarPlace.geometry.coordinates[0],
                  polarPlace,
                })
              }
              onMouseLeave={() => setHoveredResult(null)}
              locationType={`${polarPlace.terrain} i ${polarPlace.area}`}
            />
          ))}
        </List>
      </AccordionItemContent>
    </AccordionItem>
  );
};
