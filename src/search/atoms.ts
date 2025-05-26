import { atom } from 'jotai';
import { Address, PlaceName, Property, Road } from '../types/searchTypes.ts';

export type SearchResultBase = {
  navn: string;
  lat: number;
  lon: number;
};

export type SearchResult = SearchResultBase &
  (
    | { property: Property }
    | { road: Road }
    | { locationName: PlaceName }
    | { address: Address }
  );

export const selectedSearchResultAtom = atom<SearchResult | null>(null);
