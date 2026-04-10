import { toaster } from '@kvib/react';
import { getDefaultStore } from 'jotai';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import { transform } from 'ol/proj';
import WMTSSource from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { getDrawLayer } from '../../draw/drawControls/hooks/mapLayers';
import { getEnv } from '../../env';
import { activeThemeLayersAtom } from '../../map/layers/atoms';

import {
  BackgroundLayerName,
  isVectorTileLayer,
} from '../../map/layers/backgroundLayers';
import {
  getEffectiveWmsUrl,
  getThemeLayerById,
  themeLayerConfig,
} from '../../map/layers/themeLayerConfigApi';
import type { Layer, Matrix, WmsLayer } from './printApi';
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

const KARTVERKET_CACHE_URL = 'https://cache.kartverket.no/v1/service';

const PIXEL_SIZE = 0.00028;

const buildBackgroundPrintLayer = (
  backgroundLayer: BackgroundLayerName,
  map: Map,
): Layer => {
  // Vector tile layers (e.g. nautical-background via MapLibre GL) cannot be
  // rendered by MapFish Print. Fall back to the nearest raster equivalent:
  // nautical-background → sjokartraster (mirrors the thumbnail mapping in atoms.ts).
  if (isVectorTileLayer(backgroundLayer)) {
    console.warn(
      `Vector tile layer "${backgroundLayer}" is not supported by the print server. Falling back to "sjokartraster".`,
    );
    const ENV = getEnv();
    return {
      baseURL:
        ENV.layerProviderParameters.geoNorgeWMS.baseUrl + '.sjokartraster2',
      customParams: { TRANSPARENT: 'true' },
      imageFormat: 'image/png',
      layers: ['all'],
      opacity: 1,
      type: 'WMS',
    };
  }

  // WMS background layers
  if (backgroundLayer === 'sjokartraster') {
    const ENV = getEnv();
    return {
      baseURL:
        ENV.layerProviderParameters.geoNorgeWMS.baseUrl + '.sjokartraster2',
      customParams: { TRANSPARENT: 'true' },
      imageFormat: 'image/png',
      layers: ['all'],
      opacity: 1,
      type: 'WMS',
    };
  }

  if (backgroundLayer.startsWith('Nibcache_')) {
    const ENV = getEnv();
    const nibLayer = map
      .getLayers()
      .getArray()
      .find((l) => l.get('id')?.startsWith('bg.Nibcache_'));

    if (nibLayer instanceof TileLayer) {
      const source = nibLayer.getSource();
      if (source instanceof WMTSSource) {
        const tileGrid = source.getTileGrid() as WMTSTileGrid;
        const matrixIds = tileGrid.getMatrixIds();
        const resolutions = tileGrid.getResolutions();

        const matrices: Matrix[] = matrixIds.map((identifier, i) => {
          const scaleDenominator = resolutions[i] / PIXEL_SIZE;
          const rawTileSize = tileGrid.getTileSize(i);
          const tileSize: [number, number] =
            typeof rawTileSize === 'number'
              ? [rawTileSize, rawTileSize]
              : [rawTileSize[0], rawTileSize[1]];
          const known = WMTS_MATRICES.find(
            (m) =>
              Math.abs(m.scaleDenominator - scaleDenominator) /
                scaleDenominator <
              0.001,
          );
          return {
            identifier,
            scaleDenominator,
            topLeftCorner: tileGrid.getOrigin(i) as [number, number],
            tileSize,
            matrixSize: known?.matrixSize ?? [Math.pow(2, i), Math.pow(2, i)],
          };
        });

        const rawUrl =
          source.getUrls()?.[0] ??
          `${ENV.layerProviderParameters.norgeIBilder.baseUrl}/arcgis/rest/services/${backgroundLayer}/MapServer/WMTS`;
        const isRestUrl = rawUrl.includes('{');
        const requestEncoding: 'KVP' | 'REST' = isRestUrl ? 'REST' : 'KVP';

        const baseURL = rawUrl.split('?')[0];

        return {
          baseURL,
          customParams: {
            TRANSPARENT: 'true',
            token: ENV.layerProviderParameters.norgeIBilder.apiKey,
          },
          style: source.getStyle() || 'default',
          imageFormat: source.getFormat() || 'image/png',
          layer: source.getLayer(),
          opacity: 1,
          type: 'WMTS',
          dimensions: null,
          requestEncoding,
          dimensionParams: {},
          matrixSet: source.getMatrixSet(),
          matrices,
        };
      }
    }

    console.warn(
      `Could not extract NorgeIBilder WMTS source from map. Falling back to topo.`,
    );
    return {
      baseURL: KARTVERKET_CACHE_URL,
      customParams: { TRANSPARENT: 'true' },
      style: 'default',
      imageFormat: 'image/png',
      layer: 'topo',
      opacity: 1,
      type: 'WMTS',
      dimensions: null,
      requestEncoding: 'KVP',
      dimensionParams: {},
      matrixSet: 'utm33n',
      matrices: WMTS_MATRICES,
    };
  }

  return {
    baseURL: KARTVERKET_CACHE_URL,
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
  };
};

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
    const PT_TO_METERS = 0.0254 / 72; // 1 typographic point in meters
    const extentWidthMeters = Math.abs(extent[2] - extent[0]);
    const scale =
      layout.width && layout.width > 0
        ? Math.round(extentWidthMeters / (layout.width * PT_TO_METERS))
        : 25000;

    const layers: Layer[] = [buildBackgroundPrintLayer(backgroundLayer, map)];

    const store = getDefaultStore();
    const activeThemeLayers = store.get(activeThemeLayersAtom);

    for (const themeLayerId of activeThemeLayers) {
      const themeLayer = getThemeLayerById(themeLayerConfig, themeLayerId);
      if (themeLayer && themeLayer.layers) {
        const wmsUrl = getEffectiveWmsUrl(themeLayerConfig, themeLayer);
        if (wmsUrl) {
          const layerConfig: WmsLayer = {
            baseURL: wmsUrl,
            customParams: { TRANSPARENT: 'true' },
            imageFormat: 'image/png',
            layers: [themeLayer.layers],
            opacity: 1,
            type: 'WMS',
          };
          if (themeLayer.styles) {
            layerConfig.styles = [themeLayer.styles];
          }
          layers.unshift(layerConfig);
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
          projection: targetProjection,
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
  } catch {
    onError('external api error');
    toaster.create({
      title: t('printExtent.toast.error'),
      type: 'error',
    });
  } finally {
    setLoading(false);
  }
};
