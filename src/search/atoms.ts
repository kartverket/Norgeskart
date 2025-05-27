import { atom } from 'jotai';
import { Address, PlaceName, Property, Road } from '../types/searchTypes.ts';

export type SearchResultBase = {
  name: string;
  lat: number;
  lon: number;
};

export enum SearchResultType {
  Property = 'property',
  Road = 'road',
  Place = 'place',
  Address = 'address',
}

export type SearchResult = SearchResultBase &
  (
    | {
        type: SearchResultType.Property;
        property: Property;
      }
    | {
        type: SearchResultType.Road;
        road: Road;
      }
    | {
        type: SearchResultType.Place;
        place: PlaceName;
      }
    | {
        type: SearchResultType.Address;
        address: Address;
      }
  );

export const selectedSearchResultAtom = atom<SearchResult | null>(null);
