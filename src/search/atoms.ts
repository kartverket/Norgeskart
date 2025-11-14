import { atom, getDefaultStore, useAtom, useSetAtom } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { mapAtom, ProjectionIdentifier } from '../map/atoms';
import {
  Address,
  Metadata,
  Place,
  Property,
  Road,
  SearchResult,
} from '../types/searchTypes';
import { searchResultsMapper } from './results/searchresultsMapper';
import {
  getAddresses,
  getPlaceNames,
  getPlaceNamesByLocation,
  getProperties,
  getRoads,
} from './searchApi';

type CoordinateWithProjection = {
  x: number;
  y: number;
  projection: string;
};

const getPlaceNameRadius = () => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const view = map.getView();
  view.getZoom();
  const zoom = view.getZoom() || 0;
  if (zoom < 10) return 1000;
  if (zoom < 15) return 500;
  return 150;
};

export const searchCoordinatesAtom = atom<CoordinateWithProjection | null>(
  null,
);
export const searchQueryAtom = atom<string>('');
export const searchPendingAtom = atom<boolean>(false);
export const placeNamePageAtom = atom<number>(1);

const searchCoordinatesEffect = atomEffect((get, set) => {
  const coords = get(searchCoordinatesAtom);
  if (coords === null) {
    return;
  }

  const fetchData = async () => {
    return await Promise.all([
      getPlaceNamesByLocation(
        coords.x,
        coords.y,
        getPlaceNameRadius(),
        coords.projection as ProjectionIdentifier,
      ),
    ]);
  };
  fetchData().then((res) => {
    const [placeResult] = res;
    if (placeResult.navn) {
      set(placeNameResultsAtom, placeResult.navn.map(Place.fromPlaceNamePoint));
      set(placeNameMetedataAtom, placeResult.metadata);
    }
  });
});
const searchQueryEffect = atomEffect((get, set) => {
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
      set(placeNameResultsAtom, placeResult.navn.map(Place.fromPlaceName));
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

const placeNamePageEffet = atomEffect((get, set) => {
  const page = get(placeNamePageAtom);
  const searchQuery = getDefaultStore().get(searchQueryAtom);
  if (searchQuery === '') {
    return;
  }

  const fetchPlaceNames = async () => {
    return await getPlaceNames(searchQuery, page);
  };

  fetchPlaceNames().then((placeResult) => {
    if (placeResult.navn) {
      set(placeNameResultsAtom, placeResult.navn.map(Place.fromPlaceName));
      set(placeNameMetedataAtom, placeResult.metadata);
    }
  });
});

export const addressResultsAtom = atom<Address[]>([]);
export const placeNameResultsAtom = atom<Place[]>([]);
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

export const useResetSearchResults = () => {
  const setAddressResults = useSetAtom(addressResultsAtom);
  const setPlaceNameResults = useSetAtom(placeNameResultsAtom);
  const setRoadResults = useSetAtom(roadResultsAtom);
  const setPropertyResults = useSetAtom(propertyResultsAtom);
  const setPlaceNameMetadata = useSetAtom(placeNameMetedataAtom);
  const setSearchQuery = useSetAtom(searchQueryAtom);

  return () => {
    setAddressResults([]);
    setPlaceNameResults([]);
    setRoadResults([]);
    setPropertyResults([]);
    setPlaceNameMetadata(null);
    setSearchQuery('');
  };
};

export const useSearchEffects = () => {
  useAtom(searchCoordinatesEffect);
  useAtom(searchQueryEffect);
  useAtom(placeNamePageEffet);
};
