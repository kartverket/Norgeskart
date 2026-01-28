import { getDefaultStore } from 'jotai';
import { Coordinate } from 'ol/coordinate';
import { transform } from 'ol/proj';
import { getEnv } from '../../env';
import { mapAtom } from '../../map/atoms';
import { boundNumber } from '../../shared/utils/numberUtils';
import { formatToNorwegianUTMString } from './utmStringUtils';

const env = getEnv();

export const createPosterUrl = (
  locationName: string,
  coordinates: Coordinate,
  projectionCoodrdinates: string,
  streetName: string,
  placeName: string,
  cadastreString: string,
) => {
  const params = new URLSearchParams();
  const [position1, position2] = createPositionString(
    coordinates[0],
    coordinates[1],
    projectionCoodrdinates,
  );
  params.append('locationName', encodeURIComponent(locationName));
  params.append('position1', position1);
  params.append('position2', position2);
  params.append('street', encodeURIComponent(streetName));
  params.append('place', placeName);
  const mapUrl = createMapUrl(coordinates);
  if (!mapUrl) {
    return null;
  }
  params.append('map', encodeURIComponent(mapUrl));
  params.append(
    'posDez',
    createDegreesPositionText(
      coordinates[0],
      coordinates[1],
      projectionCoodrdinates,
    ),
  );
  params.append('matrikkel', cadastreString);
  params.append(
    'utm',
    formatToNorwegianUTMString(coordinates, projectionCoodrdinates),
  );

  return `${env.emergencyPosterBaseUrl}?${params.toString()}`;
};

const hw_ratio = 1145 / 660; // Width / Height, magic numbers
const createMapUrl = (coordinates: Coordinate) => {
  const store = getDefaultStore();
  const resolution = store.get(mapAtom).getView().getResolution();
  if (!resolution) {
    return;
  }
  const currentMapHeight = boundNumber(
    resolution * window.innerHeight,
    500,
    4500,
  ); // Max 4500 or poster will be blank, min 500 to avoid too small images

  const currentMapWidth = Math.round(currentMapHeight * hw_ratio);

  const baseUrl = 'https://wms.geonorge.no/skwms1/wms.topo';
  const params = new URLSearchParams();
  params.append('SERVICE', 'WMS');
  params.append('VERSION', '1.3.0');
  params.append('REQUEST', 'GetMap');
  params.append('LAYERS', 'topo');
  params.append('WIDTH', currentMapWidth.toString());
  params.append('HEIGHT', currentMapHeight.toString());
  params.append('CRS', 'EPSG:32633');

  let bboxParam = '';
  bboxParam += `${coordinates[0] - Math.ceil(currentMapWidth / 2)},`;
  bboxParam += `${coordinates[1] - Math.ceil(currentMapHeight / 2)},`;
  bboxParam += `${coordinates[0] + Math.ceil(currentMapWidth / 2)},`;
  bboxParam += `${coordinates[1] + Math.ceil(currentMapHeight / 2)}`;

  params.append('BBOX', bboxParam);
  params.append('FORMAT', 'image/jpeg');
  const url = `${baseUrl}?${params.toString()}`;

  return url;
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

const decimalToDMS = (dec: number) => {
  const sign = dec < 0 ? -1 : 1;
  const abs = Math.abs(dec);

  let deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  let min = Math.floor(minFloat);
  let sec = (minFloat - min) * 60;

  // Handle rounding so we don’t end up with 60.000 seconds or minutes
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
