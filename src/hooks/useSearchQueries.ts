import { useQuery } from '@tanstack/react-query';
import { getAddresses, getPlaceNames } from '../api/searchApi.ts';

export const useAddresses = (searchQuery: string) =>
  useQuery({
    queryKey: ['addresses', searchQuery],
    queryFn: () => getAddresses(searchQuery),
    enabled: !!searchQuery,
  });

export const usePlaceNames = (searchQuery: string) =>
  useQuery({
    queryKey: ['placeNames', searchQuery],
    queryFn: () => getPlaceNames(searchQuery),
    enabled: !!searchQuery,
  });
