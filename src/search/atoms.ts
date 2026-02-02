import { atom, getDefaultStore, useAtom, useSetAtom } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { transform } from 'ol/proj';
import {
  DEFAULT_PROJECTION,
  mapAtom,
  ProjectionIdentifier,
} from '../map/atoms';
import { isPrintDialogOpenAtom } from '../print/atoms';
import {
  parseCoordinateInput,
  ParsedCoordinate,
} from '../shared/utils/coordinateParser';
import {
  getUrlParameter,
  removeUrlParameter,
  setUrlParameter,
} from '../shared/utils/urlUtils';
import {
  Address,
  AddressApiResponse,
  addressToSearchResult,
  coordinateToSearchResult,
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

export const searchCoordinatesAtom = atom<CoordinateWithProjection | null>(
  null,
);
const initialSearchQuery = getUrlParameter('sok') || '';
export const searchQueryAtom = atom<string>(initialSearchQuery);
export const searchPendingAtom = atom<boolean>(false);
export const placeNamePageAtom = atom<number>(1);

const searchCoordinatesEffect = atomEffect((get, set) => {
  const coords = get(searchCoordinatesAtom);
  if (coords === null) {
    removeUrlParameter('markerLon');
    removeUrlParameter('markerLat');
    return;
  }

  setUrlParameter('markerLon', coords.x.toString());
  setUrlParameter('markerLat', coords.y.toString());

  const fetchData = async () => {
    return await Promise.all([
      getPlaceNamesByLocation(
        coords.x,
        coords.y,
        500,
        coords.projection as ProjectionIdentifier,
      ),
    ]);
  };
  fetchData().then((res) => {
    const [placeResult] = res;
    if (placeResult.navn) {
      set(placesNearbyAtom, placeResult.navn.map(Place.fromPlaceNamePoint));
    }
  });
});

const performAddressSearch = async (
  searchQuery: string,
): Promise<AddressApiResponse | null> => {
  const searchConditionRegex = /\D+\s\d+.*/;
  if (searchConditionRegex.test(searchQuery)) {
    return getAddresses(searchQuery);
  }
  return null;
};
const searchQueryEffect = atomEffect((get, set) => {
  const searchQuery = get(searchQueryAtom);
  const store = getDefaultStore();

  if (searchQuery) {
    setUrlParameter('sok', searchQuery);
  } else {
    removeUrlParameter('sok');
  }

  const clearResults = () => {
    set(addressResultsAtom, []);
    set(placeNameResultsAtom, []);
    set(roadResultsAtom, []);
    set(propertyResultsAtom, []);
    set(placeNameMetedataAtom, null);
    set(coordinateResultsAtom, null);
  };

  if (searchQuery === '') {
    clearResults();
    return;
  }
  const currentProjection = store
    .get(mapAtom)
    .getView()
    .getProjection()
    .getCode() as ProjectionIdentifier;
  const parsedCoordinate = parseCoordinateInput(searchQuery, currentProjection);

  set(coordinateResultsAtom, parsedCoordinate);
  //Early return when coordinate found, no need to search then
  if (parsedCoordinate !== null) {
    set(searchPendingAtom, false);
    return;
  }
  set(searchPendingAtom, true);

  const fetchData = async () => {
    return await Promise.all([
      performAddressSearch(searchQuery),
      getPlaceNames(searchQuery, 1),
      getRoads(searchQuery),
      getProperties(searchQuery),
    ]);
  };
  fetchData()
    .then((r) => {
      const [addresResult, placeResult, roadsResult, propertiesResult] = r;
      if (addresResult?.adresser) {
        if (addresResult.adresser.length === 1) {
          const onlyAddress = addresResult.adresser[0];
          set(selectedResultAtom, addressToSearchResult(onlyAddress));
          const mapView = getDefaultStore().get(mapAtom).getView();
          mapView.setCenter(
            transform(
              [
                onlyAddress.representasjonspunkt.lon,
                onlyAddress.representasjonspunkt.lat,
              ],
              onlyAddress.representasjonspunkt.epsg,
              mapView.getProjection().getCode(),
            ),
          );
          mapView.setZoom(15);
        }
        set(addressResultsAtom, addresResult.adresser);
      } else {
        set(addressResultsAtom, []);
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
    })
    .finally(() => {
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
export const coordinateResultsAtom = atom<ParsedCoordinate | null>(null);
export const placesNearbyAtom = atom<Place[]>([]); // For use in the infobox. Populated by coordinate search rather than text search.

export const allSearchResultsAtom = atom((get) => {
  const addresses = get(addressResultsAtom);
  const placeNames = get(placeNameResultsAtom);
  const roads = get(roadResultsAtom);
  const properties = get(propertyResultsAtom);

  return searchResultsMapper(placeNames, roads, addresses, properties);
});

const getInitialSelectedResult = (): SearchResult | null => {
  const lon = getUrlParameter('markerLon');
  const lat = getUrlParameter('markerLat');
  const projection = getUrlParameter('projection') || DEFAULT_PROJECTION;

  if (lon != null && lat != null) {
    const parsedLon = parseFloat(lon);
    const parsedLat = parseFloat(lat);
    if (!Number.isNaN(parsedLon) && !Number.isNaN(parsedLat)) {
      const parsedCoordinate: ParsedCoordinate = {
        lat: parsedLon,
        lon: parsedLat,
        projection: projection as ProjectionIdentifier,
        formattedString: `${parsedLon.toFixed(2)}, ${parsedLat.toFixed(2)} @ ${projection.split(':')[1]}`,
        inputFormat: 'utm',
      };

      return coordinateToSearchResult(parsedCoordinate);
    }
  }
  return null;
};

export const selectedResultAtom = atom<SearchResult | null>(
  getInitialSelectedResult(),
);

export const selectedResultEffect = atomEffect((get, set) => {
  get(selectedResultAtom);
  set(isPrintDialogOpenAtom, false);
});

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
  useAtom(selectedResultEffect);
};
