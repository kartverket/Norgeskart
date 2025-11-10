import { useQuery } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import {
  addressResultsAtom,
  placeNameMetedataAtom,
  placeNameResultsAtom,
  propertyResultsAtom,
  roadResultsAtom,
} from './atoms.ts';
import {
  getAddresses,
  getPlaceNames,
  getProperties,
  getRoads,
} from './searchApi.ts';

export const useAddresses = (searchQuery: string) => {
  const setAddressData = useSetAtom(addressResultsAtom);
  const {
    data: addressData,
    isLoading: addressLoading,
    error: addressError,
  } = useQuery({
    queryKey: ['addresses', searchQuery],
    queryFn: () => getAddresses(searchQuery),
    enabled: !!searchQuery,
  });
  if (addressData) {
    setAddressData(addressData.adresser);
  }
  if (searchQuery === '') {
    setAddressData([]);
  }

  return { addressData, addressLoading, addressError };
};

export const usePlaceNames = (searchQuery: string, currentPage: number) => {
  const setPlaceNameData = useSetAtom(placeNameResultsAtom);
  const setPlaceNameMetadata = useSetAtom(placeNameMetedataAtom);
  const {
    data: placeNameData,
    isLoading: placeNameLoading,
    error: placeNameError,
  } = useQuery({
    queryKey: ['placeNames', searchQuery, currentPage],
    queryFn: () => getPlaceNames(searchQuery, currentPage),
    enabled: !!searchQuery,
  });
  if (placeNameData) {
    setPlaceNameData(placeNameData.navn);
    setPlaceNameMetadata(placeNameData.metadata);
  }
  if (searchQuery === '') {
    setPlaceNameData([]);
    setPlaceNameMetadata(null);
  }

  return { placeNameData, placeNameLoading, placeNameError };
};

export const useRoads = (searchQuery: string) => {
  const setRoadData = useSetAtom(roadResultsAtom);
  const {
    data: roadsData,
    isLoading: roadsLoading,
    error: roadsError,
  } = useQuery({
    queryKey: ['roads', searchQuery],
    queryFn: () => getRoads(searchQuery),
    enabled: !!searchQuery,
  });
  if (roadsData) {
    setRoadData(roadsData);
  }
  if (searchQuery === '') {
    setRoadData([]);
  }

  return { roadsData, roadsLoading, roadsError };
};

export const useProperties = (searchQuery: string) => {
  const setPropertyData = useSetAtom(propertyResultsAtom);
  const {
    data: propertiesData,
    isLoading: propertiesLoading,
    error: propertiesError,
  } = useQuery({
    queryKey: ['properties', searchQuery],
    queryFn: () => getProperties(searchQuery),
    enabled: !!searchQuery,
  });
  if (propertiesData) {
    setPropertyData(propertiesData);
  }
  if (searchQuery === '') {
    setPropertyData([]);
  }

  return { propertiesData, propertiesLoading, propertiesError };
};
