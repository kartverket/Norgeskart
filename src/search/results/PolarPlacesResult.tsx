import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  List,
  Pagination,
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
} from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { POLAR_PLACES_PER_PAGE } from '../../search/searchApi';
import { capitalizeFirstLetter } from '../../shared/utils/stringUtils';
import { SearchResult } from '../../types/searchTypes';
import {
  polarPlaceCountAtom,
  polarPlaceNameResultsAtom,
  polarPlacePageAtom,
} from '../atoms';
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
  const polarPlaceCount = useAtomValue(polarPlaceCountAtom);
  const [polarPlacePage, setPolarPlacePage] = useAtom(polarPlacePageAtom);
  const { t } = useTranslation();

  if (polarPlaces.length === 0) return null;

  return (
    <AccordionItem value="polarPlaces">
      <AccordionItemTrigger onClick={onTabClick}>
        {t('search.polarPlaceNames')} ({polarPlaceCount})
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
              locationType={`${capitalizeFirstLetter(polarPlace.terrain)} i ${polarPlace.area}`}
            />
          ))}
        </List>

        {polarPlaceCount > POLAR_PLACES_PER_PAGE && (
          <Pagination
            siblingCount={1}
            size="sm"
            count={polarPlaceCount}
            page={polarPlacePage}
            pageSize={POLAR_PLACES_PER_PAGE}
            onPageChange={(event: { page: number }) =>
              setPolarPlacePage(event.page)
            }
          >
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Pagination>
        )}
      </AccordionItemContent>
    </AccordionItem>
  );
};
