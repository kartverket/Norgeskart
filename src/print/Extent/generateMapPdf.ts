import { toaster } from '@kvib/react';
import { getDefaultStore } from 'jotai';
import { GeoJSON } from 'ol/format';
import Map from 'ol/Map';
import { transform } from 'ol/proj';
import { getStyleForStorage } from '../../api/nkApiClient';
import { getDrawLayer } from '../../draw/drawControls/hooks/mapLayers';
import type { BackgroundLayerName } from '../../map/layers/backgroundLayers';
import { getScaleFromResolution } from '../../map/mapScale';
import { drawStyleReadAtom } from '../../settings/draw/atoms';
import type { Layer } from './printApi';
import { Payload, pollPdfStatus, requestPdfGeneration } from './printApi';
import { PrintLayout } from './usePrintCapabilities';
import { createGeoJsonLayerWithStyles, getSymbolizersFromStyle } from './utils';

type GenerateMapPdfProps = {
  map: Map;
  setLoading: (value: boolean) => void;
  t: (key: string) => string;
  layout: PrintLayout;
  backgroundLayer: BackgroundLayerName;
  extent: number[];
}

type WMTS_MATRICES = {
  identifier: string;
  scaleDenominator: number;
  topLeftCorner: [number, number];
  tileSize: [number, number];
  matrixSize: [number, number];
}

const BASE_URL = 'https://cache.kartverket.no/v1/service';

const WMTS_MATRICES: WMTS_MATRICES[] = [
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
];

export const generateMapPdf = async ({
  map,
  setLoading,
  t,
  layout,
  backgroundLayer,
  extent,
}: GenerateMapPdfProps) => {
  if (!map) return;

  setLoading(true);

  try {
    //Hent ut og forbered kartdata
    const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
    const [lon, lat] = center;
    const sourceProjection = map.getView().getProjection().getCode();
    const targetProjection = 'EPSG:25833';
    const [convertedLon, convertedLat] = transform(
      [lon, lat],
      sourceProjection,
      targetProjection,
    );
    const rotation = map.getView().getRotation() || 0;
    const rotationDegrees = (rotation * 180) / Math.PI;
    const resolution = map.getView().getResolution();
    const scale = resolution ? getScaleFromResolution(resolution, map) : 25000;

    //Bygg WMTS-lag for bakgrunnskart
    const layers: Layer[] = [
      {
        baseURL: BASE_URL,
        customParams: { TRANSPARENT: 'true' },
        style: 'default',
        imageFormat: 'image/png',
        layer: backgroundLayer,
        opacity: 1,
        type: 'WMTS',
        dimensions: null,
        requestEncoding: 'KVP',
        dimensionParams: {},
        matrixSet: 'utm33n',
        matrices: WMTS_MATRICES,
      },
    ];

    const drawLayer = getDrawLayer();
    const source = drawLayer?.getSource();
    const features = source?.getFeatures() ?? [];

    if (features.length > 0) {
      const style = getDefaultStore().get(drawStyleReadAtom);
      const styleForStorage = getStyleForStorage(style);

      // Bruk hjelpefunksjonen for å lage geojson-lag med styles
      if (styleForStorage) {
        const geoJsonLayer = createGeoJsonLayerWithStyles(
          features,
          sourceProjection,
          targetProjection,
          styleForStorage
        );
        layers.unshift(geoJsonLayer);
      }
    }

    //Bygg opp payload for print-API
    const payload: Payload = {
      attributes: {
        map: {
          center: [convertedLon, convertedLat],
          projection: sourceProjection,
          dpi: 128,
          rotation: rotationDegrees,
          scale: scale,
          layers: layers,
        },
        pos: `${convertedLon.toFixed(2)}, ${convertedLat.toFixed(2)}`,
        scale_string: `1: ${scale}`,
      },
      layout: layout.name,
      outputFormat: 'pdf',
      outputFilename: 'norgeskart-utskrift',
    };


    //Send til print-API
    const result = await requestPdfGeneration(payload);
    const downloadURL = await pollPdfStatus(result.statusURL);

    console.log(
      'PRINT PAYLOAD:',
      JSON.stringify(payload.attributes.map.layers, null, 2),
    );

    if (downloadURL) {
      window.open(downloadURL, '_blank');
      toaster.create({
        title: t('printExtent.toast.success'),
        type: 'success',
      });
    } else {
      toaster.create({ title: t('printExtent.toast.error'), type: 'error' });
    }
  } catch (err) {
    toaster.create({
      title: t('printExtent.toast.error'),
      type: 'error',
    });
  } finally {
    setLoading(false);
  }
};
