import { atom } from 'jotai';
import {
  Address,
  PlaceName,
  Property,
  Road,
  SearchResult,
} from '../types/searchTypes';
import { searchResultsMapper } from './results/searchresultsMapper';

export const searchResultsAtom = atom<SearchResult[]>([]);
export const addressResultsAtom = atom<Address[]>([]);
export const placeNameResultsAtom = atom<PlaceName[]>([]);
export const placeNameMetedataAtom = atom<any>(null);
export const roadResultsAtom = atom<Road[]>([]);
export const propertyResultsAtom = atom<Property[]>([]);

export const allSearchResultsAtom = atom((get) => {
  const addresses = get(addressResultsAtom);
  const placeNames = get(placeNameResultsAtom);
  const roads = get(roadResultsAtom);
  const properties = get(propertyResultsAtom);

  return searchResultsMapper(placeNames, roads, addresses, properties);
});
