import { toaster } from "@kvib/react";
import { requestPdfGeneration, pollPdfStatus } from "../../api/printApi";

interface GenerateMapPdfProps {
  map: any;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  setLoading: (value: boolean) => void;
  t: (key: string) => string;
}

export const generateMapPdf = async ({
  map,
  overlayRef,
  setLoading,
  t,
}: GenerateMapPdfProps) => {
  if (!map || !overlayRef.current) return;

  setLoading(true);

  try {
    const overlayRect = overlayRef.current.getBoundingClientRect();
    const mapRect = map.getViewport().getBoundingClientRect();
    const centerX = overlayRect.left - mapRect.left + overlayRect.width / 2;
    const centerY = overlayRect.top - mapRect.top + overlayRect.height / 2;
    const [lon, lat] = map.getCoordinateFromPixel([centerX, centerY]);
    const projection = map.getView().getProjection().getCode();
    console.log("Generating PDF at:", { lon, lat, projection });

    const payload = {
    attributes: {
        map: {
        center: [lon, lat],
        dpi: 128,
        layers: [
            {
            baseURL: "https://api.norgeskart.no/v1/matrikkel/wms",
            customParams: {
                TRANSPARENT: "true",
                CQL_FILTER: "BYGNINGSTATUS<9 OR BYGNINGSTATUS=13"
            },
            imageFormat: "image/png",
            layers: ["matrikkel:BYGNINGWFS"],
            opacity: 1,
            type: "WMS"
            },
            {
            baseURL: "https://api.norgeskart.no/v1/matrikkel/wms",
            customParams: {
                TRANSPARENT: "true"
            },
            imageFormat: "image/png",
            layers: ["matrikkel:MATRIKKELADRESSEWFS,matrikkel:VEGADRESSEWFS"],
            opacity: 1,
            type: "WMS"
            },
            {
            baseURL: "https://cache.kartverket.no/v1/service",
            customParams: {
                TRANSPARENT: "true"
            },
            style: "default",
            imageFormat: "image/png",
            layer: "topo",
            opacity: 1,
            type: "WMTS",
            dimensions: null,
            requestEncoding: "KVP",
            dimensionParams: {},
            matrixSet: "utm33n",
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
                { identifier: "18", scaleDenominator: 295.1485770089286, topLeftCorner: [-2500000, 9045984], tileSize: [256, 256], matrixSize: [262144, 262144] }
            ]
            }
        ],
        rotation: 0,
        projection: projection,
        scale: 10000
        },
        pos: `${lon.toFixed(2)}, ${lat.toFixed(2)}`,
        scale_string: "1:25000",
        title: ""
    },
    layout: "1_A4_portrait",
    outputFormat: "pdf",
    outputFilename: "norgeskart-utskrift"
    };

    const result = await requestPdfGeneration(payload);

    const downloadURL = await pollPdfStatus(result.statusURL);

    if (downloadURL) {
     window.open(`${downloadURL}`, "_blank");
      toaster.create({
        title: t("PDF ready"),
        description: t("Your map has been downloaded successfully."),
        type: "success",
      });
    } else {
      toaster.create({
        title: t("Failed to generate PDF."),
        description: t("PDF generation timed out after multiple attempts."),
        type: "error",
      });
    }
  } catch (err: any) {
    console.error("PDF generation failed:", err);
    toaster.create({
      title: t("Failed to generate PDF."),
      description: err.message || String(err),
      type: "error",
    });
  } finally {
    setLoading(false);
  }
};
