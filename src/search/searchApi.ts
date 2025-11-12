import { transform } from 'ol/proj';
import { getEnv } from '../env.ts';
import { ProjectionIdentifier } from '../map/atoms.ts';
import {
  AddressApiResponse,
  PlaceNameApiResponse,
  PlaceNamePointApiResponse,
  Property,
  Road,
} from '../types/searchTypes.ts';

const env = getEnv();

export const getAddresses = async (
  query: string,
): Promise<AddressApiResponse> => {
  const res = await fetch(
    `${env.geoNorgeApiBaseUrl}/adresser/v1/sok?sok=${query}&treffPerSide=10`,
  );
  if (!res.ok) throw new Error('Feil ved henting av adresser');
  return res.json();
};

export const getAdressesByLocation = async (
  x: number,
  y: number,
  projection: ProjectionIdentifier,
): Promise<AddressApiResponse> => {
  const transformedCoord = transform([x, y], projection, 'EPSG:4326');
  const res = await fetch(
    `${env.geoNorgeApiBaseUrl}/adresser/v1/punktsok?radius=50&lat=${transformedCoord[1]}&lon=${transformedCoord[0]}&treffPerSide=10`,
  );
  if (!res.ok) throw new Error('Feil ved henting av adresser');
  return res.json();
};

export const getPlaceNames = async (
  query: string,
  page: number,
): Promise<PlaceNameApiResponse> => {
  const res = await fetch(
    `${env.geoNorgeApiBaseUrl}/stedsnavn/v1/navn?sok=${query}*&treffPerSide=15&side=${page}`,
  );
  if (!res.ok) throw new Error('Feil ved henting av stedsnavn');
  return res.json();
};

export const getPlaceNamesByLocation = async (
  x: number,
  y: number,
  projection: ProjectionIdentifier,
): Promise<PlaceNamePointApiResponse> => {
  const projectionEPSGNumber = projection.split(':')[1];
  const res = await fetch(
    `${env.geoNorgeApiBaseUrl}/stedsnavn/v1/punkt?nord=${y}&ost=${x}&treffPerSide=35&koordsys=${projectionEPSGNumber}&radius=150&side=1`,
  );
  if (!res.ok) throw new Error('Feil ved henting av stedsnavn');
  return res.json();
};

export const getRoads = async (query: string): Promise<Road[]> => {
  const res = await fetch(`${env.apiUrl}/v1/matrikkel/veg/${query}`);
  if (!res.ok) throw new Error('Feil ved henting av veg');
  return res.json();
};

export const getProperties = async (query: string): Promise<Property[]> => {
  const res = await fetch(`${env.apiUrl}/v1/matrikkel/eie/${query}`);
  if (!res.ok) throw new Error('Feil ved henting av eiendom');
  return res.json();
};

export const getElevation = async (x: number, y: number) => {
  const res = await fetch(
    `https://hoydedata.no/arcgis/rest/services/NHM_DTM_TOPOBATHY_25833/ImageServer/identify?f=json&geometry=${x},${y}&geometryType=esriGeometryPoint&sr=25833&returnGeometry=false&returnCatalogItems=false`,
  );
  if (!res.ok) throw new Error('Feil ved henting av høyde');
  return res.json();
};

export const getPropetyInfoByCoordinates = async (lat: number, lon: number) => {
  const res = await fetch(
    `${env.geoNorgeApiBaseUrl}/eiendom/v1/punkt/omrader?radius=1&nord=${lat}&ost=${lon}&koordsys=4258`,
  );
  if (!res.ok) throw new Error('Feil ved henting av eiendomsinformasjon');
  return res.json();
};

export const getPropertyDetailsByMatrikkelId = async (
  kommunenr: string,
  gardsnr: string,
  bruksnr: string,
  festenr: string = '0',
  seksjonsnr: string = '0',
) => {
  const isNumeric = (value: string) => /^\d+$/.test(value);

  if (
    !isNumeric(kommunenr) ||
    !isNumeric(gardsnr) ||
    !isNumeric(bruksnr) ||
    !isNumeric(festenr) ||
    !isNumeric(seksjonsnr)
  ) {
    throw new Error('Alle parametere må være numeriske verdier.');
  }

  let url = `${env.apiUrl}/v1/matrikkel/eiendom/`;
  if (festenr !== '0') {
    if (seksjonsnr === '0') {
      url += `${kommunenr}-${gardsnr}/${bruksnr}/${festenr}`;
    } else {
      url += `${kommunenr}-${gardsnr}/${bruksnr}/${festenr}/${seksjonsnr}`;
    }
  } else {
    url += `${kommunenr}-${gardsnr}/${bruksnr}`;
  }
  url += `&KILDE:Eiendom KOMMUNENR:${kommunenr} GARDSNR:${gardsnr} BRUKSNR:${bruksnr} SEKSJONSNR:${seksjonsnr} FESTENR:${festenr}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Feil ved henting av matrikkeldetaljer');
  return res.json();
};

export const getPlaceNamesByCoordinates = async (
  north: number,
  east: number,
): Promise<PlaceNamePointApiResponse> => {
  const res = await fetch(
    `${env.geoNorgeApiBaseUrl}/stedsnavn/v1/punkt?nord=${north}&ost=${east}&treffPerSide=35&koordsys=25833&radius=150&side=1`,
  );
  if (!res.ok) throw new Error('Feil ved henting av stedsnavn');
  return res.json();
};
