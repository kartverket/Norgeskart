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
import { SearchResult } from '../../types/searchTypes';
import {
  placeNameMetedataAtom,
  placeNamePageAtom,
  placeNameResultsAtom,
} from '../atoms';
import { SearchResultLine } from './SearchResultLine';

interface PlacesResultProps {
  handleSearchClick: (res: SearchResult) => void;
  handleHover: (res: SearchResult) => void;
  setHoveredResult: (res: SearchResult | null) => void;
  onTabClick: () => void;
}

export const PlacesResult = ({
  handleSearchClick,
  handleHover,
  setHoveredResult,
  onTabClick,
}: PlacesResultProps) => {
  const places = useAtomValue(placeNameResultsAtom);
  const placesMetadata = useAtomValue(placeNameMetedataAtom);
  const [placesPage, setPlacesPage] = useAtom(placeNamePageAtom);

  const { t } = useTranslation();
  if (placesMetadata === null) {
    return null;
  }
  if (places.length === 0) {
    return null;
  }

  return (
    <AccordionItem value="places">
      <AccordionItemTrigger onClick={onTabClick}>
        {t('search.placeName')} ({placesMetadata.totaltAntallTreff})
      </AccordionItemTrigger>
      <AccordionItemContent>
        <List>
          {places.map((place, i) => {
            const municipalityNames =
              place.municipalities && place.municipalities.length > 0
                ? place.municipalities.map((k) => k.kommunenavn).join(', ')
                : '';
            return (
              <SearchResultLine
                key={`place-${i}`}
                heading={place.name}
                onClick={() => {
                  handleSearchClick({
                    type: 'Place',
                    name: place.name,
                    lat: place.location.nord,
                    lon: place.location.øst,
                    place,
                  });
                }}
                onMouseEnter={() =>
                  handleHover({
                    type: 'Place',
                    name: place.name,
                    lat: place.location.nord,
                    lon: place.location.øst,
                    place,
                  })
                }
                onMouseLeave={() => setHoveredResult(null)}
                locationType={
                  municipalityNames
                    ? `${place.placeType} i ${municipalityNames}`
                    : place.placeType
                }
              />
            );
          })}
        </List>
        {placesMetadata.totaltAntallTreff > placesMetadata.treffPerSide && (
          <Pagination
            siblingCount={1}
            size="sm"
            count={placesMetadata.totaltAntallTreff}
            page={placesPage}
            pageSize={placesMetadata.treffPerSide}
            onPageChange={(e: { page: number }) => setPlacesPage(e.page)}
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
