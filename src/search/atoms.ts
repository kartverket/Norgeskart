import { atom } from 'jotai';
import { Adresse, Eiendom, StedsNavn, Veg } from '../types/searchTypes.ts';

export type SearchResult = StedsNavn | Veg | Eiendom | Adresse;

export const selectedSearchResultAtom = atom<SearchResult | null>(null);
