import {
  AdresseApiResponse,
  StedsnavnApiResponse,
} from '../types/searchTypes.ts';

export const getAddresses = async (
  query: string,
): Promise<AdresseApiResponse> => {
  const res = await fetch(
    `https://ws.geonorge.no/adresser/v1/sok?sok=${query}`,
  );
  if (!res.ok) throw new Error('Feil ved henting av adresser');
  return res.json();
};

export const getPlaceNames = async (
  query: string,
  page: number,
): Promise<StedsnavnApiResponse> => {
  const res = await fetch(
    `https://ws.geonorge.no/stedsnavn/v1/navn?sok=${query}&fuzzy=true&treffPerSide=15&side=${page}`,
  );
  if (!res.ok) throw new Error('Feil ved henting av stedsnavn');
  return res.json();
};
