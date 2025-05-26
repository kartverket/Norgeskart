import { atom } from 'jotai';
import { Adresse, Eiendom, StedsNavn, Veg } from '../types/searchTypes.ts';

export type SearchResultBase = {
  navn: string;
  lat: number;
  lon: number;
};

export type SearchResult = SearchResultBase &
  (
    | { property: Eiendom }
    | { road: Veg }
    | { locationName: StedsNavn }
    | { address: Adresse }
  );

export const selectedSearchResultAtom = atom<SearchResult | null>(null);
