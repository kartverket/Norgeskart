interface PdfStatusResponse {
  status: string;
  downloadURL?: string;
}

interface Matrix {
  identifier: string;
  scaleDenominator: number;
  topLeftCorner: [number, number];
  tileSize: [number, number];
  matrixSize: [number, number];
}

interface Layer {
  baseURL: string;
  customParams: { TRANSPARENT: string };
  style: string;
  imageFormat: string;
  layer: string;
  opacity: number;
  type: 'WMTS';
  dimensions: null;
  requestEncoding: 'KVP';
  dimensionParams: Record<string, unknown>;
  matrixSet: string;
  matrices: Matrix[];
}

interface MapAttributes {
  center: [number, number];
  projection: string;
  dpi: number;
  rotation: number;
  scale: number;
  layers: Layer[];
}

interface Attributes {
  map: MapAttributes;
  pos: string;
  scale_string: string;
  // title?: string; // Uncomment if needed
}

export interface Payload {
  attributes: Attributes;
  layout: string;
  outputFormat: 'pdf' | 'png' | 'jpg'; // Extend if needed
  outputFilename: string;
}

const BASE_API_URL = 'https://ws.geonorge.no';

export const requestPdfGeneration = async (
  payload: Payload,
): Promise<{ statusURL: string }> => {
  const response = await fetch(`${BASE_API_URL}/print/kv/report.pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);
  return await response.json();
};

export const pollPdfStatus = async (
  statusURL: string,
  maxAttempts = 10,
  interval = 2000,
  baseURL = BASE_API_URL,
): Promise<string | null> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${baseURL}/${statusURL}`);
      if (!response.ok)
        throw new Error(
          `Polling failed: ${response.status} ${response.statusText}`,
        );

      const data: PdfStatusResponse = await response.json();

      if (data.status === 'finished' && data.downloadURL) {
        // Return the full download URL instead of opening window here
        return `${baseURL}/${data.downloadURL}`;
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  console.warn('Polling exceeded maximum attempts');
  return null;
};
