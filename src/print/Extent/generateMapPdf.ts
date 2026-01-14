import { toaster } from '@kvib/react';
import Map from 'ol/Map';
import { transform } from 'ol/proj';
import {
  Payload,
  pollPdfStatus,
  requestPdfGeneration,
} from '../../api/printApi';
import type { BackgroundLayerName } from '../../map/layers/backgroundLayers';
import { getScaleFromResolution } from '../../map/mapScale';

interface GenerateMapPdfProps {
  map: Map;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  setLoading: (value: boolean) => void;
  t: (key: string) => string;
  currentLayout: string;
  backgroundLayer: BackgroundLayerName;
}

export const generateMapPdf = async ({
  map,
  overlayRef,
  setLoading,
  t,
  currentLayout,
  backgroundLayer,
}: GenerateMapPdfProps) => {
  if (!map || !overlayRef.current) return;

  setLoading(true);

  try {
    const overlayRect = overlayRef.current.getBoundingClientRect();
    const mapRect = map.getViewport().getBoundingClientRect();
    const centerX = overlayRect.left - mapRect.left + overlayRect.width / 2;
    const centerY = overlayRect.top - mapRect.top + overlayRect.height / 2;
    const [lon, lat] = map.getCoordinateFromPixel([centerX, centerY]);
    const sourceProjection = map.getView().getProjection().getCode();


    const baseURL = 'https://cache.kartverket.no/v1/service';
    const matrixSet = 'utm33n';

    const targetProjection = 'EPSG:25833';
    const [convertedLon, convertedLat] = transform(
      [lon, lat],
      sourceProjection,
      targetProjection,
    );

    const rotation = map.getView().getRotation() || 0;
    const rotationDegrees = (rotation * 180) / Math.PI;

    const layoutMap: Record<string, string> = {
      'A4 Portrait': '1_A4_portrait',
      'A4 Landscape': '2_A4_landscape',
      'A3 Portrait': '3_A3_portrait',
      'A3 Landscape': '4_A3_landscape',
    };
    const api_layout = layoutMap[currentLayout] || '1_A4_portrait';

    const resolution = map.getView().getResolution();
    const scale = resolution ? getScaleFromResolution(resolution, map) : 25000;
    const roundedScale = Math.round(scale);

    const payload: Payload = {
      attributes: {
        map: {
          center: [convertedLon, convertedLat],
          projection: sourceProjection,
          dpi: 128,
          rotation: rotationDegrees,
          scale: roundedScale,
          layers: [
            {
              baseURL: baseURL,
              customParams: { TRANSPARENT: 'true' },
              style: 'default',
              imageFormat: 'image/png',
              layer: backgroundLayer,
              opacity: 1,
              type: 'WMTS',
              dimensions: null,
              requestEncoding: 'KVP',
              dimensionParams: {},
              matrixSet: matrixSet,
              matrices: [
                //gjerne ta dette ut i noe eget
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
      // toaster.create({ title: t('printMap.printSuccess'), type: 'success' });
      toaster.create({ title: 'print sucess', type: 'success' });
    } else {
      // toaster.create({ title: t('printMap.printError'), type: 'error' });
      toaster.create({ title: 'print error', type: 'error' });
    }
  } catch (err) {
    console.error('printMap.printError', err);
    // toaster.create({ title: t('printMap.printError'), description: String(err), type: 'error' });
  } finally {
    setLoading(false);
  }
};
