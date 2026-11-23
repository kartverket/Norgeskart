import { atom } from 'jotai';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import TileLayer from 'ol/layer/Tile';
import type Map from 'ol/Map';
import { getPointResolution, get as getProjection } from 'ol/proj';
import { TileWMS } from 'ol/source';
import { useEffect, useState } from 'react';
import { urlGeoJsonLayersAtom } from './urlGeoJson';

const WMS_PROTOCOL_PARAMS = ['request', 'service', 'version'];
const CAPABILITIES_TIMEOUT_MS = 30_000;
// Services without a root layer name: beyond this, start with one layer only.
const MAX_DEFAULT_LAYERS = 20;

const deleteParams = (params: URLSearchParams, names: string[]) => {
  for (const key of [...params.keys()]) {
    if (names.includes(key.toLowerCase())) params.delete(key);
  }
};

const splitNames = (names: string | null | undefined): string[] =>
  (names ?? '')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);

/** Base URL without WMS protocol params; a LAYERS param is returned separately. */
export const parseWmsUrl = (
  raw: string,
): { baseUrl: string; layers: string[] } | null => {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  // http: is blocked as mixed content (69 catalog entries still use it).
  if (url.protocol === 'http:' && url.hostname !== 'localhost') {
    url.protocol = 'https:';
  }
  const layersKey = [...url.searchParams.keys()].find(
    (k) => k.toLowerCase() === 'layers',
  );
  const layers = splitNames(layersKey && url.searchParams.get(layersKey));
  deleteParams(url.searchParams, [...WMS_PROTOCOL_PARAMS, 'layers']);
  return { baseUrl: url.toString(), layers };
};

export type WmsLayerNode = {
  name?: string;
  title: string;
  crs: string[];
  minScale?: number;
  maxScale?: number;
  queryable: boolean;
  children: WmsLayerNode[];
};

type RawWmsLayer = {
  Name?: string;
  Title?: string;
  CRS?: string[];
  MinScaleDenominator?: number;
  MaxScaleDenominator?: number;
  queryable?: boolean;
  Layer?: RawWmsLayer[];
};

const toNode = (raw: RawWmsLayer, parent?: WmsLayerNode): WmsLayerNode => {
  const node: WmsLayerNode = {
    name: raw.Name || undefined,
    title: raw.Title || raw.Name || '',
    crs: [...new Set([...(parent?.crs ?? []), ...(raw.CRS ?? [])])],
    minScale: raw.MinScaleDenominator ?? parent?.minScale,
    maxScale: raw.MaxScaleDenominator ?? parent?.maxScale,
    queryable: raw.queryable ?? parent?.queryable ?? false,
    children: [],
  };
  node.children = (raw.Layer ?? []).map((child) => toNode(child, node));
  return node;
};

export const parseWmsCapabilities = (xml: string): WmsLayerNode => {
  const result = new WMSCapabilities().read(xml) as {
    Capability?: { Layer?: RawWmsLayer };
  } | null;
  const root = result?.Capability?.Layer;
  if (!root) throw new Error('No layer in capabilities');
  return toNode(root);
};

const capabilitiesCache: Record<string, Promise<WmsLayerNode>> = {};

export const fetchWmsCapabilities = (
  baseUrl: string,
): Promise<WmsLayerNode> => {
  capabilitiesCache[baseUrl] ??= (async () => {
    const url = new URL(baseUrl);
    url.searchParams.set('SERVICE', 'WMS');
    url.searchParams.set('REQUEST', 'GetCapabilities');
    // OL only reads CRS lists from 1.3.0 documents.
    url.searchParams.set('VERSION', '1.3.0');
    const resp = await fetch(url, {
      signal: AbortSignal.timeout(CAPABILITIES_TIMEOUT_MS),
    });
    if (!resp.ok) throw new Error(`GetCapabilities ${resp.status}`);
    return parseWmsCapabilities(await resp.text());
  })().catch((e: unknown) => {
    delete capabilitiesCache[baseUrl]; // allow a retry
    throw e;
  });
  return capabilitiesCache[baseUrl];
};

export const flattenNodes = (node: WmsLayerNode): WmsLayerNode[] => [
  node,
  ...node.children.flatMap(flattenNodes),
];

export const leafNodes = (node: WmsLayerNode): WmsLayerNode[] =>
  flattenNodes(node).filter((n) => n.name && n.children.length === 0);

/** Leaves drawn by a LAYERS value; a group name draws all its leaves. */
export const selectedLeaves = (root: WmsLayerNode, names: string[]) =>
  new Set(
    flattenNodes(root)
      .filter((n) => n.name && names.includes(n.name))
      .flatMap(leafNodes)
      .map((n) => n.name as string),
  );

/** Capabilities order (= draw order); the root name when everything is on. */
export const layersForLeaves = (root: WmsLayerNode, selected: Set<string>) => {
  const leaves = leafNodes(root).map((n) => n.name as string);
  return root.name && leaves.every((l) => selected.has(l))
    ? [root.name]
    : leaves.filter((l) => selected.has(l));
};

const topNamedNodes = (node: WmsLayerNode): WmsLayerNode[] =>
  node.name ? [node] : node.children.flatMap(topNamedNodes);

const normalizeTitle = (text: string) =>
  text
    .toLowerCase()
    .replace(/\bwms\b/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

/**
 * Matches wanted names and the title against what the service really has, else
 * the whole service. `titleFirst` for datasets: their catalog layer name can be
 * another dataset's. Empty when a specific layer isn't among too many.
 */
export const selectWmsNodes = (
  root: WmsLayerNode,
  wanted: string[],
  title?: string,
  titleFirst = false,
): WmsLayerNode[] => {
  const named = flattenNodes(root).filter((n) => n.name);
  const key = normalizeTitle(title ?? '');
  const match = key
    ? named.find((n) => n !== root && normalizeTitle(n.title) === key)
    : undefined;
  if (titleFirst && match) return [match];

  const found = wanted.flatMap((name) => {
    // Catalog names may carry a GeoServer "workspace:" prefix.
    const bare = name.slice(name.lastIndexOf(':') + 1);
    const node =
      named.find((n) => n.name === name) ?? named.find((n) => n.name === bare);
    return node ? [node] : [];
  });
  if (found.length > 0) return [...new Set(found)];
  if (match) return [match];

  const top = topNamedNodes(root);
  if (top.length <= MAX_DEFAULT_LAYERS) return top;
  return wanted.length > 0 || titleFirst ? [] : top.slice(0, 1);
};

/** Range where at least one of the layers draws. */
export const combinedScaleRange = (nodes: WmsLayerNode[]): WmsScaleRange => {
  const min = nodes.map((n) => n.minScale);
  const max = nodes.map((n) => n.maxScale);
  return {
    minScale: min.every((s) => s !== undefined) ? Math.min(...min) : undefined,
    maxScale: max.every((s) => s !== undefined) ? Math.max(...max) : undefined,
  };
};

const FALLBACK_CRS = ['EPSG:25833', 'EPSG:25832', 'EPSG:3857', 'EPSG:4326'];

// OL reprojects when the service lacks the map's CRS.
const pickCrs = (mapProjection: string, nodes: WmsLayerNode[]): string =>
  [mapProjection, ...FALLBACK_CRS].find(
    (crs) => getProjection(crs) && nodes.every((n) => n.crs.includes(crs)),
  ) ?? mapProjection;

export type UrlWmsProperties = {
  layerTitle?: string;
  serviceTitle?: string;
  scaleRange?: WmsScaleRange;
  queryable?: boolean;
  infoFormat?: string;
  /** Catalog id, kept in ?geonorge=; other layers are kept in ?wmsUrl=. */
  geonorgeId?: string;
  geonorgeDetailsUrl?: string;
  /** Id in geonorgeWmsLayers.json. */
  entryId?: string;
  /** LAYERS that geonorgeId resolves to on its own. */
  defaultLayers?: string;
};

let nextLayerNumber = 0;

const buildLayer = (
  baseUrl: string,
  layers: string,
  projection: string,
  properties: UrlWmsProperties,
): TileLayer =>
  new TileLayer({
    source: new TileWMS({
      url: baseUrl,
      params: { LAYERS: layers, TRANSPARENT: true, TILED: true },
      projection,
      cacheSize: 512,
      transition: 0,
    }),
    zIndex: WMS_ZINDEX_BASE,
    properties: {
      queryable: true,
      layerTitle: layers,
      defaultLayers: layers,
      ...properties,
      // Counter, not list index: an index is reused after a removal.
      id: `theme.urlWms.${nextLayerNumber++}`,
    },
  });

/** Layer whose LAYERS value is already verified; no capabilities request. */
export const createVerifiedWmsLayer = (
  baseUrl: string,
  layers: string,
  projection: string,
  properties: UrlWmsProperties = {},
): TileLayer => buildLayer(baseUrl, layers, projection, properties);

export type UrlWmsRequest = {
  url: string;
  /** Layer names to use if the service has them. */
  wanted?: string[];
  /** Title to look for among the layers, before `wanted` if `titleFirst`. */
  matchTitle?: string;
  titleFirst?: boolean;
  /** Without capabilities, trust `wanted` instead of failing. */
  allowUnverified?: boolean;
  projection: string;
  properties?: UrlWmsProperties;
};

/** Throws when the service can't be shown. */
export const createUrlWmsLayer = async ({
  url,
  wanted = [],
  matchTitle,
  titleFirst,
  allowUnverified = false,
  projection,
  properties = {},
}: UrlWmsRequest): Promise<TileLayer> => {
  const parsed = parseWmsUrl(url);
  if (!parsed) throw new Error(`Invalid WMS URL: ${url}`);
  const names = wanted.length > 0 ? wanted : parsed.layers;

  let root: WmsLayerNode;
  try {
    root = await fetchWmsCapabilities(parsed.baseUrl);
  } catch (e) {
    // Explicit names can still draw without readable capabilities.
    if (names.length === 0 || !allowUnverified) throw e;
    return buildLayer(parsed.baseUrl, names.join(','), projection, properties);
  }

  const nodes = selectWmsNodes(root, names, matchTitle, titleFirst);
  if (nodes.length === 0) throw new Error('Layer not found in capabilities');
  return buildLayer(
    parsed.baseUrl,
    nodes.map((n) => n.name).join(','),
    pickCrs(projection, nodes),
    {
      layerTitle: nodes.length === 1 ? nodes[0].title : root.title,
      serviceTitle: root.title,
      scaleRange: combinedScaleRange(nodes),
      queryable: nodes.some((n) =>
        flattenNodes(n).some((descendant) => descendant.queryable),
      ),
      ...properties,
    },
  );
};

export const getWmsBaseUrl = (layer: TileLayer): string =>
  (layer.getSource() as TileWMS).getUrls()?.[0] ?? '';

export const getWmsLayerNames = (layer: TileLayer): string[] =>
  splitNames((layer.getSource() as TileWMS).getParams().LAYERS as string);

// URL WMS layers occupy z-indices in the range [8, 9) so they sit above
// background layers (max 6) but below theme/GeoJSON layers (10).
const WMS_ZINDEX_BASE = 8;

export const assignZIndices = (layers: TileLayer[]) => {
  layers.forEach((layer, i) => {
    // Index 0 = top of list = highest z-index. Divided to stay below 9.
    layer.setZIndex(WMS_ZINDEX_BASE + (layers.length - 1 - i) / layers.length);
  });
};

const DEAD_AFTER_ERRORS = 3;

/**
 * Calls onDead when no tile has ever loaded. First tries one real layer: met.no's
 * NetCDF services advertise a root layer ("MS") they answer 500 for.
 */
export const watchTileErrors = (
  layer: TileLayer,
  onChange: () => void,
  onDead: () => void,
) => {
  const watch = (source: TileWMS, canRetry: boolean) => {
    let errors = 0;
    let isSettled = false;
    source.on('tileloadend', () => {
      isSettled = true;
    });
    source.on('tileloaderror', () => {
      if (isSettled || ++errors < DEAD_AFTER_ERRORS) return;
      isSettled = true;
      void (async () => {
        const leaf = canRetry ? await firstLeafOfGroup(layer) : null;
        if (!leaf?.name) return onDead();
        // New source, so late errors from the old tiles aren't counted.
        const next = new TileWMS({
          url: source.getUrls()?.[0],
          params: { ...source.getParams(), LAYERS: leaf.name },
          projection: source.getProjection() ?? undefined,
          transition: 0,
        });
        watch(next, false);
        layer.setSource(next);
        onChange();
      })();
    });
  };
  watch(layer.getSource() as TileWMS, true);
};

const firstLeafOfGroup = async (
  layer: TileLayer,
): Promise<WmsLayerNode | null> => {
  try {
    const root = await fetchWmsCapabilities(getWmsBaseUrl(layer));
    const [name] = getWmsLayerNames(layer);
    const node = flattenNodes(root).find((n) => n.name === name);
    return node && node.children.length > 0 ? leafNodes(node)[0] : null;
  } catch {
    return null;
  }
};

export const urlWmsLayersAtom = atom<TileLayer[]>([]);

// Atoms, not component state: MapComponent remounts with the layout.
export const urlWmsLoadAtom = atom<'idle' | 'loading' | 'done'>('idle');
// True for the first caller only. Reads the store, since a rendered value is
// stale in StrictMode's second effect run.
export const claimUrlWmsLoadAtom = atom(null, (get, set): boolean => {
  if (get(urlWmsLoadAtom) !== 'idle') return false;
  set(urlWmsLoadAtom, 'loading');
  return true;
});
// Kept in the URL: the service may be back on the next reload.
export const failedUrlWmsAtom = atom({
  geonorge: [] as string[],
  wmsUrls: [] as string[],
});

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
