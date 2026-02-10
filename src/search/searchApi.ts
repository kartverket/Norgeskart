import { transform } from 'ol/proj';
import { getEnv } from '../env.ts';
import { ProjectionIdentifier } from '../map/projections/types.ts';
import {
  AddressApiResponse,
  EmergencyPosterResponse,
  PlaceNameApiResponse,
  PlaceNamePointApiResponse,
  Property,
  Road,
} from '../types/searchTypes.ts';

const env = getEnv();

export const getAddresses = async (
  query: string,
): Promise<AddressApiResponse> => {
  try {
    const encodedQuery = encodeURIComponent(query);
    const res = await fetch(
      `${env.geoNorgeApiBaseUrl}/adresser/v1/sok?sok=${encodedQuery}&treffPerSide=100&fuzzy=true`,
    );
    if (!res.ok) {
      console.warn(`API failed [addresses]: ${res.status} for "${query}"`);
      return {
        adresser: [],
        metadata: {
          side: 1,
          totaltAntallTreff: 0,
          treffPerSide: 100,
          viserFra: 0,
          viserTil: 0,
          sokeStreng: query,
          utkoordsys: 4258,
        },
      };
    }
    return res.json();
  } catch (error) {
    console.error(`Error [addresses]: ${query}`, error);
    return {
      adresser: [],
      metadata: {
        side: 1,
        totaltAntallTreff: 0,
        treffPerSide: 100,
        viserFra: 0,
        viserTil: 0,
        sokeStreng: query,
        utkoordsys: 4258,
      },
    };
  }
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
  try {
    const searchPart = query.split(',')[0].trim();
    const municipalityPart = query.split(',')[1]?.trim();

    const encodedQuery = encodeURIComponent(searchPart);
    const encodedMunicipality = municipalityPart
      ? encodeURIComponent(municipalityPart)
      : null;
    const res = await fetch(
      `${env.geoNorgeApiBaseUrl}/stedsnavn/v1/navn?sok=${encodedQuery}*${encodedMunicipality != null ? '&kommunenavn=' + encodedMunicipality + '*' : ''}&treffPerSide=15&side=${page}`,
    );
    if (!res.ok) {
      console.warn(`API failed [placeNames]: ${res.status} for "${query}"`);
      return {
        navn: [],
        metadata: {
          side: page,
          totaltAntallTreff: 0,
          treffPerSide: 15,
          viserFra: 0,
          viserTil: 0,
          sokeStreng: query,
          utkoordsys: 25833,
        },
      };
    }
    return res.json();
  } catch (error) {
    console.error(`Error [placeNames]: ${query}`, error);
    return {
      navn: [],
      metadata: {
        side: page,
        totaltAntallTreff: 0,
        treffPerSide: 15,
        viserFra: 0,
        viserTil: 0,
        sokeStreng: query,
        utkoordsys: 25833,
      },
    };
  }
};

export const getPlaceNamesByLocation = async (
  x: number,
  y: number,
  radius: number,
  projection: ProjectionIdentifier,
): Promise<PlaceNamePointApiResponse> => {
  const projectionEPSGNumber = projection.split(':')[1];
  const res = await fetch(
    `${env.geoNorgeApiBaseUrl}/stedsnavn/v1/punkt?nord=${y}&ost=${x}&treffPerSide=20&koordsys=${projectionEPSGNumber}&radius=${radius}&side=1`,
  );
  if (!res.ok) throw new Error('Feil ved henting av stedsnavn');
  return res.json();
};

export const getRoads = async (query: string): Promise<Road[]> => {
  try {
    const encodedQuery = encodeURIComponent(query);
    const res = await fetch(`${env.apiUrl}/v1/matrikkel/veg/${encodedQuery}`);
    if (!res.ok) {
      console.warn(`API failed [roads]: ${res.status} for "${query}"`);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error(`Error [roads]: ${query}`, error);
    return [];
  }
};

// Pattern: kommunenr/gnr/bnr or kommunenr/gnr/bnr/festenr
// kommunenr is 4 digits, gnr and bnr are 1-5 digits
const SLASH_ONLY_PATTERN = /^(\d{4})\/(\d{1,5})\/(\d{1,5})(\/\d{1,5})?$/;

const normalizePropertyQuery = (query: string): string => {
  const match = query.match(SLASH_ONLY_PATTERN);

  if (match) {
    const kommunenr = match[1];
    const gnr = match[2];
    const bnr = match[3];
    const festenr = match[4] || '';

    // Convert to expected format: kommunenr-gnr/bnr(/festenr)
    return `${kommunenr}-${gnr}/${bnr}${festenr}`;
  }

  return query;
};

export const getProperties = async (query: string): Promise<Property[]> => {
  try {
    const normalizedQuery = normalizePropertyQuery(query);
    const encodedQuery = encodeURIComponent(normalizedQuery);
    const res = await fetch(`${env.apiUrl}/v1/matrikkel/eie/${encodedQuery}`);
    if (!res.ok) {
      console.warn(`API failed [properties]: ${res.status} for "${query}"`);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error(`Error [properties]: ${query}`, error);
    return [];
  }
};

export const getElevation = async (x: number, y: number) => {
  const res = await fetch(
    `https://hoydedata.no/arcgis/rest/services/NHM_DTM_TOPOBATHY_25833/ImageServer/identify?f=json&geometry=${x},${y}&geometryType=esriGeometryPoint&sr=25833&returnGeometry=false&returnCatalogItems=false`,
  );
  if (!res.ok) throw new Error('Feil ved henting av høyde');
  return res.json();
};

export const getEmergecyPosterInfoByCoordinates = async (
  lat: number,
  lon: number,
): Promise<EmergencyPosterResponse> => {
  const res = await fetch(`${env.apiUrl}/emergencyPoster/${lat}/${lon}`);
  if (!res.ok) throw new Error('Feil ved henting av informasjon for nødplakat');
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
