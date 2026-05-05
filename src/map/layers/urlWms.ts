import { atom } from 'jotai';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import TileLayer from 'ol/layer/Tile';
import { TileWMS } from 'ol/source';
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

export const urlWmsLayersAtom = atom<TileLayer[]>([]);

export const hasUrlLayersAtom = atom(
  (get) =>
    get(urlWmsLayersAtom).length > 0 || get(urlGeoJsonLayersAtom).length > 0,
);
