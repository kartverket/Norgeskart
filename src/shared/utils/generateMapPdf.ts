import { toaster } from '@kvib/react';
import { Map } from 'ol';
import proj4 from 'proj4';
import {
  Payload,
  pollPdfStatus,
  requestPdfGeneration,
} from '../../api/printApi';

interface GenerateMapPdfProps {
  map: Map;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  setLoading: (value: boolean) => void;
  t: (key: string) => string;
  currentLayout: string;
}

// Background layer configuration mapping
const backgroundLayerConfig: Record<
  string,
  {
    baseURL: string;
    layer: string;
    getMatrixSet: (projection: string) => string;
  }
> = {
  'kartverketCache.topo': {
    baseURL: 'https://cache.kartverket.no/v1/service',
    layer: 'topo',
    getMatrixSet: (projection: string) => {
      const mapping: Record<string, string> = {
        'EPSG:3857': 'webmercator',
        'EPSG:25832': 'utm32n',
        'EPSG:25833': 'utm33n',
        'EPSG:25835': 'utm35n',
      };
      return mapping[projection] || 'utm33n';
    },
  },
  'kartverketCache.topograatone': {
    baseURL: 'https://cache.kartverket.no/v1/service',
    layer: 'topograatone',
    getMatrixSet: (projection: string) => {
      const mapping: Record<string, string> = {
        'EPSG:3857': 'webmercator',
        'EPSG:25832': 'utm32n',
        'EPSG:25833': 'utm33n',
        'EPSG:25835': 'utm35n',
      };
      return mapping[projection] || 'utm33n';
    },
  },
  'kartverketCache.sjokartraster': {
    baseURL: 'https://cache.kartverket.no/v1/service',
    layer: 'sjokartraster',
    getMatrixSet: (projection: string) => {
      const mapping: Record<string, string> = {
        'EPSG:3857': 'webmercator',
        'EPSG:25832': 'utm32n',
        'EPSG:25833': 'utm33n',
        'EPSG:25835': 'utm35n',
      };
      return mapping[projection] || 'utm33n';
    },
  },
  'norgeibilder_webmercator.Nibcache_web_mercator_v2': {
    baseURL:
      'https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2', //'https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2',
    layer: 'Nibcache_web_mercator_v2',
    getMatrixSet: () => 'default028mm',
  },
  'norgeibilder_utm32.Nibcache_UTM32_EUREF89_v2': {
    baseURL:
      'https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm32_wmts_v2',
    layer: 'Nibcache_UTM32_EUREF89_v2',
    getMatrixSet: () => 'default028mm',
  },
  'norgeibilder_utm33.Nibcache_UTM33_EUREF89_v2': {
    baseURL:
      'https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2',
    layer: 'Nibcache_UTM33_EUREF89_v2',
    getMatrixSet: () => 'default028mm',
  },
  'norgeibilder_utm35.Nibcache_UTM35_EUREF89_v2': {
    baseURL:
      'https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm35_wmts_v2',
    layer: 'Nibcache_UTM35_EUREF89_v2',
    getMatrixSet: () => 'default028mm',
  },
};

// Get background layer from URL or use default
const getBackgroundLayerFromUrl = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('backgroundLayer') || 'kartverketCache.topo';
};

// Get layer info based on background layer and projection
const getWMTSLayerInfo = (backgroundLayer: string, projection: string) => {
  const config = backgroundLayerConfig[backgroundLayer];

  if (!config) {
    console.warn(`Unknown background layer: ${backgroundLayer}`);
    // Fallback to default topo layer
    const defaultConfig = backgroundLayerConfig['kartverketCache.topo'];
    return {
      baseURL: defaultConfig.baseURL,
      layer: defaultConfig.layer,
      matrixSet: defaultConfig.getMatrixSet(projection),
    };
  }

  return {
    baseURL: config.baseURL,
    layer: config.layer,
    matrixSet: config.getMatrixSet(projection),
  };
};

// Convert coordinates to EPSG:25833
const convertToEPSG25833 = (
  lon: number,
  lat: number,
  sourceProjection: string,
): [number, number] => {
  // If already in EPSG:25833, return as-is
  if (sourceProjection === 'EPSG:25833') {
    return [lon, lat];
  }

  // Define projections if not already defined
  if (!proj4.defs('EPSG:25832')) {
    proj4.defs(
      'EPSG:25832',
      '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +type=crs',
    );
  }
  if (!proj4.defs('EPSG:25833')) {
    proj4.defs(
      'EPSG:25833',
      '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +type=crs',
    );
  }
  if (!proj4.defs('EPSG:25835')) {
    proj4.defs(
      'EPSG:25835',
      '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +type=crs',
    );
  }
  if (!proj4.defs('EPSG:3857')) {
    proj4.defs(
      'EPSG:3857',
      '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs',
    );
  }

  try {
    const converted = proj4(sourceProjection, 'EPSG:25833', [lon, lat]);
    return [converted[0], converted[1]];
  } catch (error) {
    console.error('Failed to convert coordinates:', error);
    return [lon, lat]; // Return original if conversion fails
  }
};

const AVAILABLE_SCALES = [
  250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000,
  1000000, 2500000,
];

/**
 * Returns the nearest scale from AVAILABLE_SCALES
 * based on the current map view.
 */
export function getNearestScale(map: Map): number | null {
  const view = map.getView();

  const resolution = view.getResolution();
  if (!resolution) return null;

  const projection = view.getProjection();
  const mpu = projection.getMetersPerUnit()!;
  console.log(
    'Map projection:',
    projection.getCode(),
    'MPU:',
    mpu,
    'Resolution:',
    resolution,
  );

  const dpi = 25.4 / 0.28; // ≈ 90.714
  const inchesPerMeter = 39.37;

  // Compute current map scale
  const currentScale = resolution * mpu * inchesPerMeter * dpi;

  // Clamp to min/max available scales since it has issue with go to the 1st and last scale.
  const MIN = AVAILABLE_SCALES[0];
  const MAX = AVAILABLE_SCALES[AVAILABLE_SCALES.length - 1];

  if (currentScale <= MIN) return MIN;
  if (currentScale >= MAX) return MAX;

  // Find nearest scale
  let nearest: number;

  if (projection.getCode() === 'EPSG:3857') {
    //  NEAREST SMALLER SCALE (for EPSG:3857)
    nearest = AVAILABLE_SCALES.reduce((prev, curr) =>
      curr <= currentScale && (prev > currentScale || curr > prev)
        ? curr
        : prev,
    );
  } else {
    //  NEAREST BIGGER SCALE (for other projections)
    nearest = AVAILABLE_SCALES.reduce((prev, curr) =>
      curr >= currentScale && (prev < currentScale || curr < prev)
        ? curr
        : prev,
    );
  }

  return nearest;
}

export const generateMapPdf = async ({
  map,
  overlayRef,
  setLoading,
  t,
  currentLayout,
}: GenerateMapPdfProps) => {
  if (!map || !overlayRef.current) {
    console.warn('Map or overlay not available for PDF generation.');
    return;
  }

  setLoading(true);
  console.log('Using layout in hook:', currentLayout);

  try {
    const overlayRect = overlayRef.current.getBoundingClientRect();
    const mapRect = map.getViewport().getBoundingClientRect();
    const centerX = overlayRect.left - mapRect.left + overlayRect.width / 2;
    const centerY = overlayRect.top - mapRect.top + overlayRect.height / 2;
    const [lon, lat] = map.getCoordinateFromPixel([centerX, centerY]);
    const sourceProjection = map.getView().getProjection().getCode();

    // Convert coordinates to EPSG:25833 for the PDF
    const [convertedLon, convertedLat] = convertToEPSG25833(
      lon,
      lat,
      sourceProjection,
    );
    const targetProjection = 'EPSG:25833';

    // Get current background layer from URL
    const backgroundLayer = getBackgroundLayerFromUrl();

    // Get dynamic layer info based on background layer and TARGET projection (25833)
    const layerInfo = getWMTSLayerInfo(backgroundLayer, targetProjection);

    console.log('Generating PDF at:', {
      original: { layerInfo, lon, lat, projection: sourceProjection },
      converted: {
        lon: convertedLon,
        lat: convertedLat,
        projection: targetProjection,
      },
      backgroundLayer,
    });

    const rotation = map.getView().getRotation() || 0;
    const rotationDegrees = (rotation * 180) / Math.PI;

    let scale = getNearestScale(map);

    const layoutMap: Record<string, string> = {
      'A4 Portrait': '1_A4_portrait',
      'A4 Landscape': '2_A4_landscape',
      'A3 Portrait': '3_A3_portrait',
      'A3 Landscape': '4_A3_landscape',
    };
    if (scale === null) {
      scale = 25000;
    }

    const api_layout = layoutMap[currentLayout] || '1_A4_portrait';
    console.log('Mapped layout for API:', api_layout);

    const payload: Payload = {
      attributes: {
        map: {
          center: [convertedLon, convertedLat],
          projection: sourceProjection,
          dpi: 128,
          rotation: rotationDegrees,
          scale: scale,
          layers: [
            {
              baseURL: layerInfo.baseURL,
              customParams: { TRANSPARENT: 'true' },
              style: 'default',
              imageFormat: 'image/png',
              layer: layerInfo.layer,
              opacity: 1,
              type: 'WMTS',
              dimensions: null,
              requestEncoding: 'KVP',
              dimensionParams: {},
              matrixSet: layerInfo.matrixSet,
              matrices: [
                {
                  identifier: '0',
                  scaleDenominator: 77371428.57142858,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [1, 1],
                },
                {
                  identifier: '1',
                  scaleDenominator: 38685714.28571429,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [2, 2],
                },
                {
                  identifier: '2',
                  scaleDenominator: 19342857.142857146,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [4, 4],
                },
                {
                  identifier: '3',
                  scaleDenominator: 9671428.571428573,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [8, 8],
                },
                {
                  identifier: '4',
                  scaleDenominator: 4835714.285714286,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [16, 16],
                },
                {
                  identifier: '5',
                  scaleDenominator: 2417857.142857143,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [32, 32],
                },
                {
                  identifier: '6',
                  scaleDenominator: 1208928.5714285716,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [64, 64],
                },
                {
                  identifier: '7',
                  scaleDenominator: 604464.2857142858,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [128, 128],
                },
                {
                  identifier: '8',
                  scaleDenominator: 302232.1428571429,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [256, 256],
                },
                {
                  identifier: '9',
                  scaleDenominator: 151116.07142857145,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [512, 512],
                },
                {
                  identifier: '10',
                  scaleDenominator: 75558.03571428572,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [1024, 1024],
                },
                {
                  identifier: '11',
                  scaleDenominator: 37779.01785714286,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [2048, 2048],
                },
                {
                  identifier: '12',
                  scaleDenominator: 18889.50892857143,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [4096, 4096],
                },
                {
                  identifier: '13',
                  scaleDenominator: 9444.754464285716,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [8192, 8192],
                },
                {
                  identifier: '14',
                  scaleDenominator: 4722.377232142858,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [16384, 16384],
                },
                {
                  identifier: '15',
                  scaleDenominator: 2361.188616071429,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [32768, 32768],
                },
                {
                  identifier: '16',
                  scaleDenominator: 1180.5943080357144,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [65536, 65536],
                },
                {
                  identifier: '17',
                  scaleDenominator: 590.2971540178572,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [131072, 131072],
                },
                {
                  identifier: '18',
                  scaleDenominator: 295.1485770089286,
                  topLeftCorner: [-2500000, 9045984],
                  tileSize: [256, 256],
                  matrixSize: [262144, 262144],
                },
              ],
            },
          ],
        },
        pos: `${convertedLon.toFixed(2)}, ${convertedLat.toFixed(2)}`,
        scale_string: `1: ${scale}`,
      },
      layout: api_layout,
      outputFormat: 'pdf',
      outputFilename: 'norgeskart-utskrift',
    };

    const result = await requestPdfGeneration(payload);
    const downloadURL = await pollPdfStatus(result.statusURL);

    if (downloadURL) {
      window.open(downloadURL, '_blank');
      toaster.create({
        title: t('printMap.printSuccess') || 'PDF ready',
        description:
          t('Your map has been downloaded successfully.') ||
          'Your map is ready to download.',
        type: 'success',
      });
    } else {
      toaster.create({
        title: t('printMap.printError') || 'Failed to generate PDF.',
        description:
          t('PDF generation timed out after multiple attempts.') ||
          'The PDF generation took too long.',
        type: 'error',
      });
    }
  } catch (err) {
    console.error('printMap.printError', err);
    const message = err instanceof Error ? err.message : String(err);
    toaster.create({
      title: t('printMap.printError') || 'Failed to generate PDF',
      description: message,
      type: 'error',
    });
  } finally {
    setLoading(false);
  }
};
