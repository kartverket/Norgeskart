import { atom } from 'jotai';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import TileLayer from 'ol/layer/Tile';
import type Map from 'ol/Map';
import { getPointResolution } from 'ol/proj';
import { TileWMS } from 'ol/source';
import { useEffect, useState } from 'react';
import { urlGeoJsonLayersAtom } from './urlGeoJson';

const WMS_PROTOCOL_PARAMS = ['request', 'service', 'version'];

const normalizeWmsBaseUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const params = new URLSearchParams(parsed.search);
    for (const key of WMS_PROTOCOL_PARAMS) {
      params.delete(key.toLowerCase());
      params.delete(key.toUpperCase());
    }
    parsed.search = params.toString();
    return parsed.toString();
  } catch {
    return url;
  }
};

type WmsCapResult = {
  Capability?: {
    Layer?: { Name?: string; Layer?: unknown[] };
  };
};

const fetchRootLayerName = async (baseUrl: string): Promise<string> => {
  const capUrl = new URL(baseUrl);
  capUrl.searchParams.set('SERVICE', 'WMS');
  capUrl.searchParams.set('REQUEST', 'GetCapabilities');

  const resp = await fetch(capUrl.toString());
  if (!resp.ok) throw new Error(`GetCapabilities ${resp.status}`);

  const parser = new WMSCapabilities();
  const result = parser.read(await resp.text()) as WmsCapResult;

  const rootLayer = result?.Capability?.Layer;
  if (!rootLayer) throw new Error('No layer in capabilities');
  if (rootLayer.Name) return rootLayer.Name;

  // Root layer has no Name (e.g. ArcGIS Server WMS) — fall back to first child layer
  const firstChild = (
    rootLayer.Layer as Array<{ Name?: string }> | undefined
  )?.[0];
  if (firstChild?.Name) return firstChild.Name;

  throw new Error('No layer name found in capabilities');
};

export const createUrlWmsLayer = async (
  rawWmsUrl: string,
  explicitWmsLayer: string | undefined,
  mapProjection: string,
  index: number,
): Promise<TileLayer | null> => {
  const baseUrl = normalizeWmsBaseUrl(rawWmsUrl);

  let wmsLayers: string;
  try {
    wmsLayers = explicitWmsLayer ?? (await fetchRootLayerName(baseUrl));
  } catch (e) {
    console.error('[urlWms] could not resolve WMS layers:', e);
    return null;
  }

  return new TileLayer({
    source: new TileWMS({
      url: baseUrl,
      params: {
        LAYERS: wmsLayers,
        TRANSPARENT: true,
        SRS: mapProjection,
        TILED: true,
      },
      projection: mapProjection,
      cacheSize: 512,
      transition: 0,
    }),
    zIndex: 8,
    properties: {
      id: `theme.urlWms.${index}`,
      queryable: true,
      layerTitle: wmsLayers,
    },
  });
};

// URL WMS layers occupy z-indices in the range [8, 9) so they sit above
// background layers (max 6) but below theme/GeoJSON layers (10).
const WMS_ZINDEX_BASE = 8;
const WMS_ZINDEX_STEP = 0.1;

export const assignZIndices = (layers: TileLayer[]) => {
  layers.forEach((layer, i) => {
    // Index 0 = top of list = highest z-index (rendered on top)
    layer.setZIndex(
      WMS_ZINDEX_BASE + (layers.length - 1 - i) * WMS_ZINDEX_STEP,
    );
  });
};

export const urlWmsLayersAtom = atom<TileLayer[]>([]);

export const hasUrlLayersAtom = atom(
  (get) =>
    get(urlWmsLayersAtom).length > 0 || get(urlGeoJsonLayersAtom).length > 0,
);

// Servers only draw between Min/MaxScaleDenominator (NVE "Dam": below 1:75 000).
// Compared in WMS scale (0.28 mm pixels), not the toolbar's 96 DPI scale.

const WMS_PIXEL_SIZE_M = 0.00028;

export type WmsScaleRange = { minScale?: number; maxScale?: number };

const metersPerProjectionUnit = (map: Map) => {
  const view = map.getView();
  const center = view.getCenter();
  return center ? getPointResolution(view.getProjection(), 1, center) : 1;
};

export const getWmsScale = (map: Map) =>
  ((map.getView().getResolution() ?? 0) * metersPerProjectionUnit(map)) /
  WMS_PIXEL_SIZE_M;

export const resolutionForWmsScale = (map: Map, scale: number) =>
  (scale * WMS_PIXEL_SIZE_M) / metersPerProjectionUnit(map);

/** 'zoomIn' / 'zoomOut' when the layer draws nothing at this scale. */
export const scaleRangeStatus = (
  scale: number,
  { minScale, maxScale }: WmsScaleRange,
): 'visible' | 'zoomIn' | 'zoomOut' => {
  if (maxScale !== undefined && scale >= maxScale) return 'zoomIn';
  if (minScale !== undefined && scale < minScale) return 'zoomOut';
  return 'visible';
};

/** Current WMS scale of the map, updated after every pan/zoom. */
export const useWmsScale = (map: Map) => {
  const [scale, setScale] = useState(() => getWmsScale(map));
  useEffect(() => {
    const update = () => setScale(getWmsScale(map));
    map.on('moveend', update);
    return () => map.un('moveend', update);
  }, [map]);
  return scale;
};
