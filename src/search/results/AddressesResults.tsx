import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  List,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { Address, SearchResult } from '../../types/searchTypes';
import { SearchResultLine } from './SearchResultLine';

interface AddressesResultsProps {
  addresses: Address[];
  handleSearchClick: (res: SearchResult) => void;
  handleHover: (res: SearchResult) => void;
  setHoveredResult: (res: SearchResult | null) => void;
  onTabClick: () => void;
}

export const AddressesResults = ({
  addresses,
  handleSearchClick,
  handleHover,
  setHoveredResult,
  onTabClick,
}: AddressesResultsProps) => {
  const { t } = useTranslation();

  return (
    <AccordionItem value="addresses">
      <AccordionItemTrigger onClick={onTabClick}>
        {t('search.addresses')} ({addresses.length})
      </AccordionItemTrigger>
      <AccordionItemContent>
        <List>
          {addresses.map((address, i) => (
            <SearchResultLine
              key={`address-${i}`}
              heading={`${address.adressenavn}, ${address.adressetekst}`}
              onClick={() =>
                handleSearchClick({
                  type: 'Address',
                  name: address.adressenavn,
                  lat: address.representasjonspunkt.lat,
                  lon: address.representasjonspunkt.lon,
                  address,
                })
              }
              onMouseEnter={() =>
                handleHover({
                  type: 'Address',
                  name: address.adressenavn,
                  lat: address.representasjonspunkt.lat,
                  lon: address.representasjonspunkt.lon,
                  address,
                })
              }
              onMouseLeave={() => setHoveredResult(null)}
            />
          ))}
        </List>
      </AccordionItemContent>
    </AccordionItem>
  );
};
