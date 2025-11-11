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
        {t('search.placeName')} ({places.length})
      </AccordionItemTrigger>
      <AccordionItemContent>
        <List>
          {places.map((place, i) => {
            const municipalityNames =
              place.kommuner && place.kommuner.length > 0
                ? place.kommuner.map((k) => k.kommunenavn).join(', ')
                : '';
            return (
              <SearchResultLine
                key={`place-${i}`}
                heading={place.skrivemåte}
                onClick={() => {
                  handleSearchClick({
                    type: 'Place',
                    name: place.skrivemåte,
                    lat: place.representasjonspunkt.nord,
                    lon: place.representasjonspunkt.øst,
                    place,
                  });
                }}
                onMouseEnter={() =>
                  handleHover({
                    type: 'Place',
                    name: place.skrivemåte,
                    lat: place.representasjonspunkt.nord,
                    lon: place.representasjonspunkt.øst,
                    place,
                  })
                }
                onMouseLeave={() => setHoveredResult(null)}
                locationType={
                  municipalityNames
                    ? `${place.navneobjekttype} i ${municipalityNames}`
                    : place.navneobjekttype
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
