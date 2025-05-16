import { Adresser, StedsnavnApiResponse } from '../types/searchTypes.ts';

export const getAddresses = async (query: string): Promise<Adresser> => {
  const res = await fetch(`https://ws.geonorge.no/adresser/v1/sok?sok=${query}`);
  if (!res.ok) throw new Error('Feil ved henting av adresser');
  return res.json();
}

export const getPlaceNames = async (query: string): Promise<StedsnavnApiResponse> => {
  const res = await fetch(`https://ws.geonorge.no/stedsnavn/v1/navn?sok=${query}`);
  if (!res.ok) throw new Error('Feil ved henting av stedsnavn');
  return res.json();
};

export const getSearchResults = async (query: string) => {
  const addresses = await getAddresses(query);
  const placeNames = await getPlaceNames(query);
  return { addresses, placeNames }
}
