import { useQuery } from '@tanstack/react-query';
import { getAddresses, getPlaceNames } from './searchApi.ts';

export const useAddresses = (searchQuery: string) =>
  useQuery({
    queryKey: ['addresses', searchQuery],
    queryFn: () => getAddresses(searchQuery),
    enabled: !!searchQuery,
  });

export const usePlaceNames = (searchQuery: string, page: number) =>
  useQuery({
    queryKey: ['placeNames', searchQuery, page],
    queryFn: () => getPlaceNames(searchQuery, page),
    enabled: !!searchQuery,
  });
