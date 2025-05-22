import { useQuery } from '@tanstack/react-query';
import {
  getAddresses,
  getPlaceNames,
  getProperties,
  getRoads,
} from './searchApi.ts';

export const useAddresses = (searchQuery: string) => {
  const {
    data: addressData,
    isLoading: addressLoading,
    error: addressError,
  } = useQuery({
    queryKey: ['addresses', searchQuery],
    queryFn: () => getAddresses(searchQuery),
    enabled: !!searchQuery,
  });

  return { addressData, addressLoading, addressError };
};

export const usePlaceNames = (searchQuery: string, currentPage: number) => {
  const {
    data: placeNameData,
    isLoading: placeNameLoading,
    error: placeNameError,
  } = useQuery({
    queryKey: ['placeNames', searchQuery, currentPage],
    queryFn: () => getPlaceNames(searchQuery, currentPage),
    enabled: !!searchQuery,
  });

  return { placeNameData, placeNameLoading, placeNameError };
};

export const useRoads = (searchQuery: string) => {
  const {
    data: roadsData,
    isLoading: roadsLoading,
    error: roadsError,
  } = useQuery({
    queryKey: ['roads', searchQuery],
    queryFn: () => getRoads(searchQuery),
    enabled: !!searchQuery,
  });

  return { roadsData, roadsLoading, roadsError };
};

export const useProperties = (searchQuery: string) => {
  const {
    data: propertiesData,
    isLoading: propertiesLoading,
    error: propertiesError,
  } = useQuery({
    queryKey: ['properties', searchQuery],
    queryFn: () => getProperties(searchQuery),
    enabled: !!searchQuery,
  });

  return { propertiesData, propertiesLoading, propertiesError };
};
