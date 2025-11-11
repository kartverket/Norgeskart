import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import {
  Address,
  Metadata,
  PlaceName,
  Property,
  Road,
  SearchResult,
} from '../types/searchTypes';
import { searchResultsMapper } from './results/searchresultsMapper';
import {
  getAddresses,
  getPlaceNames,
  getProperties,
  getRoads,
} from './searchApi';

export const searchQueryAtom = atom<string>('');
export const searchPendingAtom = atom<boolean>(false);
export const placeNamePageAtom = atom<number>(1);

export const searchQueryEffect = atomEffect((get, set) => {
  const searchQuery = get(searchQueryAtom);
  if (searchQuery === '') {
    set(addressResultsAtom, []);
    set(placeNameResultsAtom, []);
    set(roadResultsAtom, []);
    set(propertyResultsAtom, []);
    set(placeNameMetedataAtom, null);
    return;
  }
  set(searchPendingAtom, true);

  const fetchData = async () => {
    return await Promise.all([
      getAddresses(searchQuery),
      getPlaceNames(searchQuery, 1),
      getRoads(searchQuery),
      getProperties(searchQuery),
    ]);
  };
  fetchData().then((r) => {
    const [addresResult, placeResult, roadsResult, propertiesResult] = r;
    if (addresResult.adresser) {
      set(addressResultsAtom, addresResult.adresser);
    }
    if (placeResult.navn) {
      set(placeNameResultsAtom, placeResult.navn);
      set(placeNameMetedataAtom, placeResult.metadata);
    }
    if (roadsResult) {
      set(roadResultsAtom, roadsResult);
    }
    if (propertiesResult) {
      set(propertyResultsAtom, propertiesResult);
    }
    set(searchPendingAtom, false);
  });
});

export const placeNamePageEffet = atomEffect((get, set) => {
  const page = get(placeNamePageAtom);
  const searchQuery = getDefaultStore().get(searchQueryAtom);

  const fetchPlaceNames = async () => {
    return await getPlaceNames(searchQuery, page);
  };

  fetchPlaceNames().then((placeResult) => {
    if (placeResult.navn) {
      set(placeNameResultsAtom, placeResult.navn);
      set(placeNameMetedataAtom, placeResult.metadata);
    }
  });
});

export const addressResultsAtom = atom<Address[]>([]);
export const placeNameResultsAtom = atom<PlaceName[]>([]);
export const placeNameMetedataAtom = atom<Metadata | null>(null);
export const roadResultsAtom = atom<Road[]>([]);
export const propertyResultsAtom = atom<Property[]>([]);

export const allSearchResultsAtom = atom((get) => {
  const addresses = get(addressResultsAtom);
  const placeNames = get(placeNameResultsAtom);
  const roads = get(roadResultsAtom);
  const properties = get(propertyResultsAtom);

  return searchResultsMapper(placeNames, roads, addresses, properties);
});

export const selectedResultAtom = atom<SearchResult | null>(null);
