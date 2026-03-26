import { transform } from 'ol/proj';
import posthog from 'posthog-js';
import { getEnv } from '../env.ts';
import { ProjectionIdentifier } from '../map/projections/types.ts';
import { isNumberOk } from '../shared/utils/numberUtils.ts';
import {
  AddressApiResponse,
  EmergencyPosterResponse,
  PlaceNameApiResponse,
  PlaceNamePointApiResponse,
  Property,
  Road,
} from '../types/searchTypes.ts';

const env = getEnv();

const trackApiError = (
  error: unknown,
  context: {
    url?: string;
    httpStatus?: number;
    query?: string;
    searchType: string;
  },
) => {
  console.error(`Search API error [${context.searchType}]:`, error);
  if (posthog.__loaded) {
    console.warn('PostHog is not loaded, cannot track search API error');
    posthog.captureException(error, {
      errorType: 'search_api_error',
      ...context,
    });
  }
};

export const getAddresses = async (
  query: string,
): Promise<AddressApiResponse> => {
  let url;
  let httpStatus;
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `${env.geoNorgeApiBaseUrl}/adresser/v1/sok?sok=${encodedQuery}&treffPerSide=100&fuzzy=true`;
    const res = await fetch(url);
    httpStatus = res.status;

    if (!res.ok) {
      throw new Error(
        `API failed [addresses]: ${res.status} for "${query}", Statuscode:${res.status}`,
      );
    }
    return res.json();
  } catch (error) {
    trackApiError(error, { url, httpStatus, query, searchType: 'addresses' });
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

export const PLACE_SEARCH_PAGE_SIZE = 10;
export const getPlaceNames = async (
  query: string,
  page: number,
): Promise<PlaceNameApiResponse> => {
  const searchPart = query.split(',')[0].trim();
  const municipalityPart = query.split(',')[1]?.trim();

  const encodedMunicipality = municipalityPart
    ? encodeURIComponent(municipalityPart)
    : null;

  const url = new URL(`${env.geoNorgeApiBaseUrl}/stedsnavn/v1/navn`);
  url.searchParams.append('sok', `${searchPart}*`);
  if (encodedMunicipality) {
    url.searchParams.append('kommunenavn', `${encodedMunicipality}*`);
  }
  url.searchParams.append('treffPerSide', PLACE_SEARCH_PAGE_SIZE.toString());
  url.searchParams.append('side', page.toString());
  url.searchParams.append('fuzzy', 'true');

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(
        `API failed [placeNames]: ${res.status} for "${query}", Statuscode:${res.status}`,
      );
    }
    return res.json();
  } catch (error) {
    trackApiError(error, {
      query,
      url: url.toString(),
      searchType: 'placeNames',
    });

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
  const url = `${env.geoNorgeApiBaseUrl}/stedsnavn/v1/punkt?nord=${y}&ost=${x}&treffPerSide=35&koordsys=${projectionEPSGNumber}&radius=${radius}&side=1`;
  let httpStatus;
  try {
    const res = await fetch(url);
    httpStatus = res.status;

    if (!res.ok) throw new Error('Feil ved henting av stedsnavn');
    return res.json();
  } catch (error) {
    trackApiError(error, {
      url,
      httpStatus,
      query: `x:${x}, y:${y}, radius:${radius}, projection:${projection}`,
      searchType: 'placeNamesByLocation',
    });
    throw error;
  }
};

export const getRoads = async (query: string): Promise<Road[]> => {
  const url = `${env.apiUrl}/v1/matrikkel/veg/${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `API failed [roads]: ${res.status} for "${query}", Statuscode:${res.status}`,
      );
    }
    return res.json();
  } catch (error) {
    trackApiError(error, { query, url, searchType: 'roads' });
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
  const normalizedQuery = normalizePropertyQuery(query);
  const encodedQuery = encodeURIComponent(normalizedQuery);
  const url = `${env.apiUrl}/v1/matrikkel/eie/${encodedQuery}`;
  let httpStatus;
  try {
    const res = await fetch(url);
    httpStatus = res.status;
    if (!res.ok) {
      throw new Error(
        `API failed [properties]: ${res.status} for "${query}", Statuscode:${res.status}`,
      );
    }
    return res.json();
  } catch (error) {
    trackApiError(error, { query, url, httpStatus, searchType: 'properties' });
    return [];
  }
};

export const getElevation = async (
  x: number,
  y: number,
  srs: ProjectionIdentifier,
) => {
  if (!isNumberOk(x) || !isNumberOk(y)) {
    return;
  }
  const [xTransformed, yTransformed] = transform([x, y], srs, 'EPSG:25833');

  const url = new URL(
    'https://hoydedata.no/arcgis/rest/services/NHM_DTM_TOPOBATHY_25833/ImageServer/identify',
  );
  url.searchParams.append('f', 'json');
  url.searchParams.append('geometry', `${xTransformed},${yTransformed}`);
  url.searchParams.append('geometryType', 'esriGeometryPoint');
  url.searchParams.append('sr', '25833'); //TODO ta denne som input
  url.searchParams.append('returnGeometry', 'false');
  url.searchParams.append('returnCatalogItems', 'false');
  let httpStatus;
  try {
    const res = await fetch(url.toString());
    httpStatus = res.status;
    if (!res.ok) {
      throw new Error(
        `API failed [elevation]: ${res.status} for coordinates (${x}, ${y}), Statuscode:${res.status}`,
      );
    }
    return res.json();
  } catch (error) {
    trackApiError(error, {
      url: url.toString(),
      httpStatus,
      searchType: 'elevation',
    });
    throw error;
  }
};

export const getEmergecyPosterInfoByCoordinates = async (
  lat: number,
  lon: number,
): Promise<EmergencyPosterResponse> => {
  const url = `${env.apiUrl}/emergencyPoster/${lat}/${lon}`;
  let httpStatus;
  try {
    const res = await fetch(url);
    httpStatus = res.status;
    if (!res.ok) {
      throw new Error(
        `API failed [emergencyPoster]: ${res.status} for coordinates (${lat}, ${lon}), Statuscode:${res.status}`,
      );
    }
    return res.json();
  } catch (error) {
    trackApiError(error, { url, httpStatus, searchType: 'emergencyPoster' });
    throw error;
  }
};

export const getPropetyInfoByCoordinates = async (lat: number, lon: number) => {
  const url = new URL(`${env.geoNorgeApiBaseUrl}/eiendom/v1/punkt/omrader`);
  url.searchParams.append('radius', '1');
  url.searchParams.append('nord', lat.toString());
  url.searchParams.append('ost', lon.toString());
  url.searchParams.append('koordsys', '4258');

  let httpStatus;
  try {
    const res = await fetch(url.toString());
    httpStatus = res.status;
    if (!res.ok) {
      throw new Error(
        `API failed [propertyInfoByCoordinates]: ${res.status} for coordinates (${lat}, ${lon}), Statuscode:${res.status}`,
      );
    }
    return res.json();
  } catch (error) {
    trackApiError(error, {
      url: url.toString(),
      httpStatus,
      searchType: 'propertyInfoByCoordinates',
    });
    throw error;
  }
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
    throw new Error('Alle parametere må være numeriske verdier.'); //TODO, ta inn number?!
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
  let httpStatus;
  try {
    const res = await fetch(url);
    httpStatus = res.status;
    if (!res.ok) {
      throw new Error(
        `API failed [propertyDetailsByMatrikkelId]: ${res.status} for matrikkelId (${kommunenr}-${gardsnr}/${bruksnr}/${festenr}/${seksjonsnr}), Statuscode:${res.status}`,
      );
    }
    return res.json();
  } catch (error) {
    trackApiError(error, {
      url,
      httpStatus,
      searchType: 'propertyDetailsByMatrikkelId',
    });
    throw error;
  }
};

export const getPlaceNamesByCoordinates = async (
  north: number,
  east: number,
): Promise<PlaceNamePointApiResponse> => {
  const url = new URL('https://ws.geonorge.no/stedsnavn/v1/punkt');
  url.searchParams.append('nord', north.toString());
  url.searchParams.append('ost', east.toString());
  url.searchParams.append('treffPerSide', '35');
  url.searchParams.append('koordsys', '25833');
  url.searchParams.append('radius', '150');
  url.searchParams.append('side', '1');

  let httpStatus;
  try {
    const res = await fetch(url.toString());
    httpStatus = res.status;
    if (!res.ok) throw new Error('Feil ved henting av stedsnavn');
    return res.json();
  } catch (error) {
    trackApiError(error, {
      url: url.toString(),
      httpStatus,
      query: `north:${north}, east:${east}`,
      searchType: 'placeNamesByCoordinates',
    });
    throw error;
  }
};
