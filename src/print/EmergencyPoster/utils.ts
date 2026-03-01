import { getDefaultStore } from 'jotai';
import { Coordinate } from 'ol/coordinate';
import { transform } from 'ol/proj';
import { getEnv } from '../../env';
import { mapAtom } from '../../map/atoms';
import { getScaleFromResolution } from '../../map/mapScale';
import { formatToNorwegianUTMString } from './utmStringUtils';

const env = getEnv();

export interface EmergencyPosterPayload {
  layout: string;
  outputFormat: string;
  outputFilename: string;
  attributes: {
    locationName: string;
    position1: string;
    position2: string;
    street: string;
    place: string;
    matrikkel: string;
    utm: string;
    posDez: string;
    map: {
      center: [number, number];
      projection: string;
      dpi: number;
      rotation: number;
      scale: number;
      layers: Array<{
        baseURL: string;
        customParams: { TRANSPARENT: string };
        imageFormat: string;
        layers: string[];
        opacity: number;
        type: string;
      }>;
    };
  };
}

export const createPosterPayload = (
  locationName: string,
  coordinates: Coordinate,
  projectionCoordinates: string,
  streetName: string,
  placeName: string,
  cadastreString: string,
): EmergencyPosterPayload | null => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const resolution = map.getView().getResolution();
  if (!resolution) return null;

  const scale = getScaleFromResolution(resolution, map);

  const transformedCenter = transform(
    coordinates,
    projectionCoordinates,
    'EPSG:25833',
  ) as [number, number];

  const [position1, position2] = createPositionString(
    coordinates[0],
    coordinates[1],
    projectionCoordinates,
  );

  return {
    layout: 'nodplakat',
    outputFormat: 'pdf',
    outputFilename: `${locationName}_nodplakat`,
    attributes: {
      locationName,
      position1,
      position2,
      street: streetName,
      place: placeName,
      matrikkel: cadastreString,
      utm: formatToNorwegianUTMString(coordinates, projectionCoordinates),
      posDez: createDegreesPositionText(
        coordinates[0],
        coordinates[1],
        projectionCoordinates,
      ),
      map: {
        center: transformedCenter,
        projection: 'EPSG:25833',
        dpi: 128,
        rotation: 0,
        scale,
        layers: [
          {
            baseURL: 'https://wms.geonorge.no/skwms1/wms.topo',
            customParams: { TRANSPARENT: 'true' },
            imageFormat: 'image/png',
            layers: ['topo'],
            opacity: 1,
            type: 'WMS',
          },
        ],
      },
    },
  };
};

export const submitEmergencyPoster = async (
  payload: EmergencyPosterPayload,
): Promise<{ statusURL: string }> => {
  const response = await fetch(
    `${env.emergencyPosterBaseUrl}/print/nodplakat/report.pdf`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);
  return await response.json();
};

export const pollEmergencyPosterStatus = async (
  statusURL: string,
  maxAttempts = 10,
  interval = 2000,
): Promise<string | null> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `${env.emergencyPosterBaseUrl}/${statusURL}`,
      );
      if (!response.ok) throw new Error(`Polling failed: ${response.status}`);

      const data: { status: string; downloadURL?: string } =
        await response.json();

      if (data.status === 'finished' && data.downloadURL) {
        return `${env.emergencyPosterBaseUrl}/${data.downloadURL}`;
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  return null;
};

const createPositionString = (
  x: number,
  y: number,
  projectionCode: string,
): [string, string] => {
  const geograficalCoordinates = transform([x, y], projectionCode, 'EPSG:4326');
  const pos1DMS = decimalToDMS(geograficalCoordinates[1]); // 0 is x, but should north when done
  const pos2DMS = decimalToDMS(geograficalCoordinates[0]);
  return [
    `${pos1DMS.deg} grader ${pos1DMS.min} minutter ${Math.round(pos1DMS.sec)} sekunder nord`,
    `${pos2DMS.deg} grader ${pos2DMS.min} minutter ${Math.round(pos2DMS.sec)} sekunder øst`,
  ];
};

const createDegreesPositionText = (
  x: number,
  y: number,
  projectionCode: string,
) => {
  const geograficalCoordinates = transform(
    [Number(x), Number(y)],
    projectionCode,
    'EPSG:4326',
  );
  const lat = geograficalCoordinates[1].toFixed(4);
  const lon = geograficalCoordinates[0].toFixed(4);
  return `${lat}°N ${lon}°Ø`;
};

export const decimalToDMS = (dec: number) => {
  const sign = dec < 0 ? -1 : 1;
  const abs = Math.abs(dec);

  let deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  let min = Math.floor(minFloat);
  let sec = (minFloat - min) * 60;

  // Handle rounding so we don't end up with 60.000 seconds or minutes
  sec = Math.round(sec * 1000) / 1000; // keep up to 3 decimals
  if (sec >= 60) {
    sec -= 60;
    min += 1;
  }
  if (min >= 60) {
    min -= 60;
    deg += 1;
  }

  return { deg, min, sec, sign };
};
