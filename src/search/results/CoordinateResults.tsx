import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  List,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { SearchResult } from '../../types/searchTypes';
import { ParsedCoordinate } from '../../shared/utils/coordinateParser';
import { SearchResultLine } from './SearchResultLine';

interface CoordinateResultsProps {
  coordinate: ParsedCoordinate | null;
  handleSearchClick: (res: SearchResult) => void;
  handleHover: (res: SearchResult) => void;
  setHoveredResult: (res: SearchResult | null) => void;
  onTabClick: () => void;
}

export const CoordinateResults = ({
  coordinate,
  handleSearchClick,
  handleHover,
  setHoveredResult,
  onTabClick,
}: CoordinateResultsProps) => {
  const { t } = useTranslation();

  if (!coordinate) {
    return null;
  }

  const searchResult: SearchResult = {
    type: 'Coordinate',
    name: coordinate.formattedString,
    lat: coordinate.lat,
    lon: coordinate.lon,
    coordinate: {
      formattedString: coordinate.formattedString,
      projection: coordinate.projection,
      inputFormat: coordinate.inputFormat,
    },
  };

  return (
    <AccordionItem value="coordinates">
      <AccordionItemTrigger onClick={onTabClick}>
        {t('search.coordinates')} (1)
      </AccordionItemTrigger>
      <AccordionItemContent>
        <List>
          <SearchResultLine
            key="coordinate-result"
            heading={coordinate.formattedString}
            locationType={t('infoBox.coordinateSystem') + ': ' + coordinate.projection}
            onClick={() => handleSearchClick(searchResult)}
            onMouseEnter={() => handleHover(searchResult)}
            onMouseLeave={() => setHoveredResult(null)}
          />
        </List>
      </AccordionItemContent>
    </AccordionItem>
  );
};
