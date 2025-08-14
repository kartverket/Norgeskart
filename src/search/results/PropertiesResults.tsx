import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  List,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { Property, SearchResult } from '../../types/searchTypes';
import { SearchResultLine } from './SearchResultLine';

interface PropertiesResultsProps {
  properties: Property[];
  handleSearchClick: (res: SearchResult) => void;
  handleHover: (res: SearchResult) => void;
  setHoveredResult: (res: SearchResult | null) => void;
  onTabClick: () => void;
}

export const PropertiesResults = ({
  properties,
  handleSearchClick,
  handleHover,
  setHoveredResult,
  onTabClick,
}: PropertiesResultsProps) => {
  const { t } = useTranslation();

  return (
    <AccordionItem value="properties">
      <AccordionItemTrigger onClick={onTabClick}>
        {t('search.properties')} ({properties.length})
      </AccordionItemTrigger>
      <AccordionItemContent>
        <List>
          {properties.map((property, i) => (
            <SearchResultLine
              key={`property-${i}`}
              heading={property.TITTEL}
              onClick={() =>
                handleSearchClick({
                  type: 'Property',
                  name: property.TITTEL,
                  lat: parseFloat(property.LATITUDE),
                  lon: parseFloat(property.LONGITUDE),
                  property,
                })
              }
              onMouseEnter={() =>
                handleHover({
                  type: 'Property',
                  name: property.TITTEL,
                  lat: parseFloat(property.LATITUDE),
                  lon: parseFloat(property.LONGITUDE),
                  property,
                })
              }
              onMouseLeave={() => setHoveredResult(null)}
              locationType={property.KOMMUNENAVN}
            />
          ))}
        </List>
      </AccordionItemContent>
    </AccordionItem>
  );
};
