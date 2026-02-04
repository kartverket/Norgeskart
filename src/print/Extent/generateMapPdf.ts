import { toaster } from '@kvib/react';
import { getDefaultStore } from 'jotai';
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
import { createGeoJsonLayerWithStyles } from './utils';
import { WMTS_MATRICES } from './wmtsMatrices';

type GenerateMapPdfProps = {
  map: Map;
  setLoading: (value: boolean) => void;
  t: (key: string) => string;
  layout: PrintLayout;
  backgroundLayer: BackgroundLayerName;
  extent: number[];
};

const BASE_URL = 'https://cache.kartverket.no/v1/service';

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

      if (styleForStorage) {
        const geoJsonLayer = createGeoJsonLayerWithStyles(
          features,
          sourceProjection,
          targetProjection,
          styleForStorage,
        );
        layers.unshift(geoJsonLayer);
      }
    }

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
