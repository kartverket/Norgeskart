import { getEnv } from '../../env';

const env = getEnv();

type CreateHikingMapRequest = {
  map: {
    bbox: [number, number, number, number];
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
  const requestBody: CreateHikingMapRequest = {
    map: {
      bbox: bbox,
      center: center,
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
      projection: 'EPSG:25833',
      sone: '33',
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
