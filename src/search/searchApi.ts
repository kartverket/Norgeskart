import {
  AdresseApiResponse,
  Eiendom,
  StedsnavnApiResponse,
  Veg,
} from '../types/searchTypes.ts';

//Skjønner ikke helt hva denne url'en brukes til enda.
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
    `https://ws.geonorge.no/stedsnavn/v1/navn?sok=${query}*&treffPerSide=15&side=${page}`,
  );
  if (!res.ok) throw new Error('Feil ved henting av stedsnavn');
  return res.json();
};

export const getRoads = async (query: string): Promise<Veg[]> => {
  const res = await fetch(
    `https://testapi.norgeskart.no/v1/matrikkel/veg/${query}`,
  );
  if (!res.ok) throw new Error('Feil ved henting av veg');
  return res.json();
};

export const getProperties = async (query: string): Promise<Eiendom[]> => {
  const res = await fetch(
    `https://testapi.norgeskart.no/v1/matrikkel/eie/${query}`,
  );
  if (!res.ok) throw new Error('Feil ved henting av eiendom');
  return res.json();
};
