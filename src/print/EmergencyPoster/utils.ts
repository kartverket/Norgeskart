const BASE_URL = 'https://nodplakat.norgeskart.no/fop2/fop';

export const createPosterUrl = (
  locationName: string,
  coordinates: number[],
  streetName: string,
  placeName: string,
) => {
  const params = new URLSearchParams();
  params.append('locationName', encodeURIComponent(locationName));
  params.append('position1', coordinates[0].toString()); //TODO: fix at dette skal være på norsk
  params.append('position2', coordinates[1].toString()); //TODO: fix at dette skal være på norsk
  params.append('street', encodeURIComponent(streetName));
  params.append('place', placeName);
  params.append('map', encodeURIComponent(createMapUrl(coordinates, 16)));

  //TODO: missing matrikk, utm posDez
  return `${BASE_URL}?${params.toString()}`;
};

const MAP_WIDTH_M = 1145; // Width of the map in meters for the emergency poster
const MAP_HEIGHT_M = 660; // Height of the map in meters for the emergency poster
const createMapUrl = (coordinates: number[], zoomLevel: number) => {
  const baseUrl = 'https://wms.geonorge.no/skwms1/wms.topo';
  const params = new URLSearchParams();
  params.append('SERVICE', 'WMS');
  params.append('VERSION', '1.3.0');
  params.append('REQUEST', 'GetMap');
  params.append('LAYERS', 'topo');
  params.append('WIDTH', MAP_WIDTH_M.toString());
  params.append('HEIGHT', MAP_HEIGHT_M.toString());
  params.append('CRS', 'EPSG:25833');

  params.append(
    'BBOX',
    `${coordinates[0] - MAP_WIDTH_M / 2},${coordinates[1] - MAP_HEIGHT_M / 2},${coordinates[0] + MAP_WIDTH_M / 2},${coordinates[1] + MAP_HEIGHT_M / 2}`,
  );
  params.append('FORMAT', 'image/jpeg');

  return `${baseUrl}?${params.toString()}`;
};
