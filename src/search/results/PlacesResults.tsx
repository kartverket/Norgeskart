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
import { useTranslation } from 'react-i18next';
import { Metadata, PlaceName, SearchResult } from '../../types/searchTypes';
import { SearchResultLine } from './SearchResultLine';

interface PlacesResultProps {
  places: PlaceName[];
  placesMetadata: Metadata;
  onPlacesPageChange: (_page: number) => void;
  handleSearchClick: (res: SearchResult) => void;
  handleHover: (res: SearchResult) => void;
  setHoveredResult: (res: SearchResult | null) => void;
  onTabClick: () => void;
}

export const PlacesResult = ({
  places,
  placesMetadata,
  onPlacesPageChange,
  handleSearchClick,
  handleHover,
  setHoveredResult,
  onTabClick,
}: PlacesResultProps) => {
  const { t } = useTranslation();

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
            siblingCount={4}
            size="sm"
            count={placesMetadata.totaltAntallTreff}
            page={placesMetadata.side}
            pageSize={placesMetadata.treffPerSide}
            onPageChange={(e: { page: number }) => onPlacesPageChange(e.page)}
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
