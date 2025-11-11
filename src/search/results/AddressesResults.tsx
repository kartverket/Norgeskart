import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  List,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { SearchResult } from '../../types/searchTypes';
import { addressResultsAtom } from '../atoms';
import { SearchResultLine } from './SearchResultLine';

interface AddressesResultsProps {
  handleSearchClick: (res: SearchResult) => void;
  handleHover: (res: SearchResult) => void;
  setHoveredResult: (res: SearchResult | null) => void;
  onTabClick: () => void;
}

export const AddressesResults = ({
  handleSearchClick,
  handleHover,
  setHoveredResult,
  onTabClick,
}: AddressesResultsProps) => {
  const { t } = useTranslation();
  const addresses = useAtomValue(addressResultsAtom);

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
