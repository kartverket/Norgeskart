import { toaster } from '@kvib/react';
import { getDefaultStore } from 'jotai';
import Map from 'ol/Map';
import { transform } from 'ol/proj';
import {
  getEffectiveWmsUrl,
  getThemeLayerById,
  themeLayerConfigAtom,
} from '../../api/themeLayerConfigApi';
import { getDrawLayer } from '../../draw/drawControls/hooks/mapLayers';
import { activeThemeLayersAtom } from '../../map/layers/atoms';
import type { BackgroundLayerName } from '../../map/layers/backgroundLayers';
import { getScaleFromResolution } from '../../map/mapScale';
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
  onSuccess: () => void;
  onError: (msg: string) => void;
};

const BASE_URL = 'https://cache.kartverket.no/v1/service';

export const generateMapPdf = async ({
  map,
  setLoading,
  t,
  layout,
  backgroundLayer,
  extent,
  onSuccess,
  onError,
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

    const store = getDefaultStore();
    const activeThemeLayers = store.get(activeThemeLayersAtom);
    const themeLayerConfig = store.get(themeLayerConfigAtom);

    for (const themeLayerId of activeThemeLayers) {
      const themeLayer = getThemeLayerById(themeLayerConfig, themeLayerId);
      if (themeLayer && themeLayer.layers) {
        const wmsUrl = getEffectiveWmsUrl(themeLayerConfig, themeLayer);
        if (wmsUrl) {
          layers.unshift({
            baseURL: wmsUrl,
            customParams: { TRANSPARENT: 'true' },
            imageFormat: 'image/png',
            layers: [themeLayer.layers],
            opacity: 1,
            type: 'WMS',
          });
        }
      }
    }

    const drawLayer = getDrawLayer();
    const source = drawLayer?.getSource();
    const features = source?.getFeatures() ?? [];

    if (features.length > 0) {
      const geoJsonLayer = createGeoJsonLayerWithStyles(
        features,
        sourceProjection,
        targetProjection,
      );
      layers.unshift(geoJsonLayer);
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

    if (downloadURL) {
      window.open(downloadURL, '_blank');
      toaster.create({
        title: t('printExtent.toast.success'),
        type: 'success',
      });
      onSuccess();
    } else {
      onError(t('missing downloadURL'));
      toaster.create({ title: t('printExtent.toast.error'), type: 'error' });
    }
  } catch (e) {
    onError('external api error');
    console.log('error', e);
    toaster.create({
      title: t('printExtent.toast.error'),
      type: 'error',
    });
  } finally {
    setLoading(false);
  }
};
