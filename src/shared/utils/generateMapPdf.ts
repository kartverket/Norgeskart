import { toaster } from "@kvib/react";
import { requestPdfGeneration, pollPdfStatus } from "../../api/printApi";
import proj4 from 'proj4';

interface GenerateMapPdfProps {
  map: any;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  setLoading: (value: boolean) => void;
  t: (key: string) => string;
}

// Background layer configuration mapping
const backgroundLayerConfig: Record<string, {
  baseURL: string;
  layer: string;
  getMatrixSet: (projection: string) => string;
}> = {
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
    }
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
    }
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
    }
  },
  'norgeibilder_webmercator.Nibcache_web_mercator_v2': {
    baseURL: 'https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2', //'https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2',
    layer: 'Nibcache_web_mercator_v2',
    getMatrixSet: () => 'default028mm'
  },
  'norgeibilder_utm32.Nibcache_UTM32_EUREF89_v2': {
    baseURL: 'https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm32_wmts_v2',
    layer: 'Nibcache_UTM32_EUREF89_v2',
    getMatrixSet: () => 'default028mm'
  },
  'norgeibilder_utm33.Nibcache_UTM33_EUREF89_v2': {
    baseURL: 'https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2',
    layer: 'Nibcache_UTM33_EUREF89_v2',
    getMatrixSet: () => 'default028mm'
  },
  'norgeibilder_utm35.Nibcache_UTM35_EUREF89_v2': {
    baseURL: 'https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm35_wmts_v2',
    layer: 'Nibcache_UTM35_EUREF89_v2',
    getMatrixSet: () => 'default028mm'
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
const convertToEPSG25833 = (lon: number, lat: number, sourceProjection: string): [number, number] => {
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

export const generateMapPdf = async ({
  map,
  overlayRef,
  setLoading,
  t,
}: GenerateMapPdfProps) => {
  if (!map || !overlayRef.current) {
    console.warn("Map or overlay not available for PDF generation.");
    return;
  }

  setLoading(true);

  try {
    const overlayRect = overlayRef.current.getBoundingClientRect();
    const mapRect = map.getViewport().getBoundingClientRect();
    const centerX = overlayRect.left - mapRect.left + overlayRect.width / 2;
    const centerY = overlayRect.top - mapRect.top + overlayRect.height / 2;
    const [lon, lat] = map.getCoordinateFromPixel([centerX, centerY]);
    const sourceProjection = map.getView().getProjection().getCode();

    // Convert coordinates to EPSG:25833 for the PDF
    const [convertedLon, convertedLat] = convertToEPSG25833(lon, lat, sourceProjection);
    const targetProjection = 'EPSG:25833';

    // Get current background layer from URL
    const backgroundLayer = getBackgroundLayerFromUrl();
  

    // Get dynamic layer info based on background layer and TARGET projection (25833)
    const layerInfo = getWMTSLayerInfo(backgroundLayer, targetProjection);

    console.log("Generating PDF at:", { 
      original: {layerInfo, lon, lat, projection: sourceProjection },
      converted: { lon: convertedLon, lat: convertedLat, projection: targetProjection },
      backgroundLayer 
    });

    const payload = {
      attributes: {
        map: {
          center: [convertedLon, convertedLat],
          projection : sourceProjection,
          dpi: 128,
          rotation: 0,
          scale: 25000,
          layers: [
            {
              baseURL: "https://api.norgeskart.no/v1/matrikkel/wms",
              customParams: {
                TRANSPARENT: "true",
                CQL_FILTER: "BYGNINGSTATUS<9 OR BYGNINGSTATUS=13",
              },
              imageFormat: "image/png",
              layers: ["matrikkel:BYGNINGWFS"],
              opacity: 1,
              type: "WMS",
            },
            {
              baseURL: "https://api.norgeskart.no/v1/matrikkel/wms",
              customParams: { TRANSPARENT: "true" },
              imageFormat: "image/png",
              layers: [
                "matrikkel:MATRIKKELADRESSEWFS,matrikkel:VEGADRESSEWFS",
              ],
              opacity: 1,
              type: "WMS",
            },
            {
              baseURL: layerInfo.baseURL,
              customParams: { TRANSPARENT: "true" },
              style: "default",
              imageFormat: "image/png",
              layer: layerInfo.layer,
              opacity: 1,
              type: "WMTS",
              dimensions: null,
              requestEncoding: "KVP",
              dimensionParams: {},
              matrixSet: layerInfo.matrixSet,
              matrices: [
                { identifier: "0", scaleDenominator: 77371428.57142858, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [1, 1] },
                { identifier: "1", scaleDenominator: 38685714.28571429, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [2, 2] },
                { identifier: "2", scaleDenominator: 19342857.142857146, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [4, 4] },
                { identifier: "3", scaleDenominator: 9671428.571428573, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [8, 8] },
                { identifier: "4", scaleDenominator: 4835714.285714286, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [16, 16] },
                { identifier: "5", scaleDenominator: 2417857.142857143, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [32, 32] },
                { identifier: "6", scaleDenominator: 1208928.5714285716, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [64, 64] },
                { identifier: "7", scaleDenominator: 604464.2857142858, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [128, 128] },
                { identifier: "8", scaleDenominator: 302232.1428571429, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [256, 256] },
                { identifier: "9", scaleDenominator: 151116.07142857145, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [512, 512] },
                { identifier: "10", scaleDenominator: 75558.03571428572, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [1024, 1024] },
                { identifier: "11", scaleDenominator: 37779.01785714286, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [2048, 2048] },
                { identifier: "12", scaleDenominator: 18889.50892857143, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [4096, 4096] },
                { identifier: "13", scaleDenominator: 9444.754464285716, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [8192, 8192] },
                { identifier: "14", scaleDenominator: 4722.377232142858, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [16384, 16384] },
                { identifier: "15", scaleDenominator: 2361.188616071429, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [32768, 32768] },
                { identifier: "16", scaleDenominator: 1180.5943080357144, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [65536, 65536] },
                { identifier: "17", scaleDenominator: 590.2971540178572, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [131072, 131072] },
                { identifier: "18", scaleDenominator: 295.1485770089286, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [262144, 262144] },
              ],
            },
          ],
        },
        pos: `${convertedLon.toFixed(2)}, ${convertedLat.toFixed(2)}`,
        scale_string: "1:25000",
        title: "",
      },
      layout: "1_A4_portrait",
      outputFormat: "pdf",
      outputFilename: "norgeskart-utskrift",
    };

    const result = await requestPdfGeneration(payload);
    const downloadURL = await pollPdfStatus(result.statusURL);

    if (downloadURL) {
      window.open(downloadURL, "_blank");
      toaster.create({
        title: t("PDF ready") || "PDF ready",
        description: t("Your map has been downloaded successfully.") || "Your map is ready to download.",
        type: "success",
      });
    } else {
      toaster.create({
        title: t("Failed to generate PDF.") || "Failed to generate PDF.",
        description: t("PDF generation timed out after multiple attempts.") || "The PDF generation took too long.",
        type: "error",
      });
    }
  } catch (err: any) {
    console.error("PDF generation failed:", err);
    toaster.create({
      title: t("Failed to generate PDF.") || "Failed to generate PDF",
      description: err.message || String(err),
      type: "error",
    });
  } finally {
    setLoading(false);
  }
};