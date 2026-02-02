import { getDefaultStore } from 'jotai';
import { transform } from 'ol/proj';
import { getEnv } from '../../env';
import { mapAtom } from '../../map/atoms';
import { utmInfoFromLonLat } from '../../print/EmergencyPoster/utmStringUtils';

const env = getEnv();

type CreateHikingMapRequest = {
  map: {
    bbox?: [number, number, number, number];
    center: [number, number];
    dpi: string;
    layers: Array<{
      type: string;
      baseURL: string;
      layers: string[];
      imageFormat: string;
      opacity: number;
      customParams: Record<string, string>;
    }>;
    projection: string;
    sone: string;
    biSone: string;
  };
  paging: number;
  layout: string;
  scale: string;
  titel: string;
  legend: boolean;
  trips: boolean;
  sweden: boolean;
  compass: boolean;
  link: string;
};
type CreateHikingMapResponse = {
  file_id: string;
  object_key: string;
  linkPdf: string;
  expires_at: string;
  metadata: {
    filename: string;
    size_bytes: number;
    content_type: string;
  };
};

export const createHikingMap = async (
  includeLegend: boolean,
  includeSweden: boolean,
  includeCompassInstructions: boolean,
  bbox: [number, number, number, number],
  center: [number, number],
  scale: string,
  title: string,
) => {
  const store = getDefaultStore();
  const projectionCode =
    store.get(mapAtom)?.getView().getProjection().getCode() || 'EPSG:25833';
  const [lon, lat] = transform(center, projectionCode, 'EPSG:4326');
  const utmInfo = utmInfoFromLonLat(lon, lat);
  const projectionToUse = `EPSG:326${utmInfo.zone.toString().padStart(2, '0')}`;

  const transformedCenter = transform(center, projectionCode, projectionToUse);
  const transformedBbox = bbox.map((coord, index) => {
    const x = index % 2 === 0 ? coord : bbox[index - 1];
    const y = index % 2 === 1 ? coord : bbox[index + 1];
    const [transformedX, transformedY] = transform(
      [x, y],
      projectionCode,
      projectionToUse,
    );
    return index % 2 === 0 ? transformedX : transformedY;
  }) as [number, number, number, number];

  const requestBody: CreateHikingMapRequest = {
    map: {
      bbox: transformedBbox,
      center: transformedCenter as [number, number],
      dpi: '300',
      layers: [
        {
          baseURL: 'https://wms.geonorge.no/skwms1/wms.toporaster4',
          customParams: {
            TRANSPARENT: 'false',
          },
          imageFormat: 'image/jpeg',
          layers: ['toporaster'],
          opacity: 1,
          type: 'WMS',
        },
      ],
      projection: projectionToUse,
      sone: utmInfo.zone.toString() + utmInfo.band,
      biSone: '',
    },
    paging: 12,
    layout: 'A4 landscape',
    scale: scale,
    titel: title,
    legend: includeLegend,
    trips: includeCompassInstructions,
    sweden: includeSweden,
    compass: includeCompassInstructions,
    link: 'norgeskart.no',
  };
  const response = await fetch(`${env.apiUrl}/nkprint/turkart2`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  const data: CreateHikingMapResponse = await response.json();
  return data;
};
