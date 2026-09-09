import type { MapOptions } from 'maplibre-gl';
import { getEnv } from '../../../../env';

// Resolved MapLibre style object (the non-URL half of MapOptions['style']).
export type MapLibreStyleObject = Exclude<
  NonNullable<MapOptions['style']>,
  string
>;

// The vendored style (public/styles/topo-vector.json) is the Kartverket topo
// "farge" symbology extracted from tnt-topo-qlr by tnt-martin's
// scripts/qlr_to_maplibre.py — one MapLibre source per tnt-data-ingestor
// archive (n50_arealdekke_flate, roadl, …), ~950 layers over ~125 sources.

const RASTER_FORMATS = ['png', 'webp', 'jpg', 'jpeg'];
const STATIC_STYLE_PATH = '/styles/topo-vector.json';

interface MartinCatalog {
  tiles?: Record<string, unknown>;
}

interface MartinTileJSON {
  bounds?: string | number[];
  minzoom?: number;
  maxzoom?: number;
  format?: string;
  vector_layers?: { id: string }[];
}

// Only the parts of a source/layer the reconciliation touches. The vendored
// file is a valid StyleSpecification; we re-narrow at the MapLibreLayer
// boundary where it is handed back as MapOptions['style'].
type ReconcilableStyle = {
  sources: Record<string, Record<string, unknown>>;
  layers: ({
    source?: string;
    'source-layer'?: string;
    minzoom?: number;
    maxzoom?: number;
  } & Record<string, unknown>)[];
} & Record<string, unknown>;

const getJSON = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} — ${url}`);
  }
  // A misconfigured base URL (or an SPA index.html fallback) answers 200 with
  // HTML; response.json() would then throw a bare "Unexpected token '<'".
  const text = await response.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    const contentType = response.headers.get('content-type') ?? 'none';
    const snippet = text.slice(0, 40).replace(/\s+/g, ' ');
    throw new Error(
      `${url} returned 200 but not JSON (content-type ${contentType}, ` +
        `starts "${snippet}") — is topoVectorMartin.baseUrl a real tnt-martin?`,
    );
  }
};

// Cached per session: reconciliation is ~125 TileJSON fetches, and the style is
// the same every time the user toggles the background.
let cachedStyle: Promise<MapLibreStyleObject> | undefined;

export const resolveTopoVectorStyle = (): Promise<MapLibreStyleObject> => {
  if (!cachedStyle) {
    cachedStyle = buildStyle().catch((error) => {
      cachedStyle = undefined; // let a later retry re-run
      throw error;
    });
  }
  return cachedStyle;
};

const getMartinUrl = (): string => {
  // ?topoVectorMartin=… wins, for pointing local dev at a `make up` tnt-martin
  // or the prod server without a rebuild (matches tnt-martin's kartclient).
  const override = new URLSearchParams(window.location.search).get(
    'topoVectorMartin',
  );
  const baseUrl =
    override || getEnv().layerProviderParameters.topoVectorMartin.baseUrl;
  return baseUrl.replace(/\/+$/, '');
};

const buildStyle = async (): Promise<MapLibreStyleObject> => {
  const martinUrl = getMartinUrl();

  const style = (await getJSON(
    window.location.origin + STATIC_STYLE_PATH,
  )) as ReconcilableStyle;

  // The extracted style has no symbol layers yet (labels/markers are a separate
  // piece in tnt-martin), so its openmaptiles `glyphs` URL is only ever a CSP
  // violation waiting to happen. Drop it until labels arrive with a self-hosted
  // glyph source.
  delete style.glyphs;

  const catalog = (await getJSON(`${martinUrl}/catalog`)) as MartinCatalog;
  const served = new Set(Object.keys(catalog.tiles ?? {}));

  await Promise.all(
    Object.keys(style.sources).map(async (id) => {
      if (!served.has(id)) {
        delete style.sources[id];
        return;
      }
      const tileJson = (await getJSON(`${martinUrl}/${id}`)) as MartinTileJSON;
      // Martin emits PMTiles bounds as "w,s,e,n"; the style spec wants an
      // array, and one bad source fails validation of the whole style.
      const bounds =
        typeof tileJson.bounds === 'string'
          ? tileJson.bounds.split(',').map(Number)
          : tileJson.bounds;
      const sourceMinZoom = tileJson.minzoom ?? 0;
      // fjellskygge is a raster PMTiles (no vector_layers, image format);
      // every other archive is vector MVT.
      const isRaster =
        !tileJson.vector_layers?.length &&
        RASTER_FORMATS.includes((tileJson.format ?? '').toLowerCase());

      style.sources[id] = {
        type: isRaster ? 'raster' : 'vector',
        tiles: [`${martinUrl}/${id}/{z}/{x}/{y}`],
        minzoom: sourceMinZoom,
        // MapLibre over-zooms past this, which is what bridges the ingestor's
        // narrow per-scale zoom bands.
        maxzoom: tileJson.maxzoom ?? 22,
        ...(isRaster ? { tileSize: 512 } : {}),
        ...(Array.isArray(bounds) && bounds.length === 4 ? { bounds } : {}),
      };

      if (isRaster) return; // raster layers reference the source by id only

      const realSourceLayer = tileJson.vector_layers?.[0]?.id;
      for (const layer of style.layers) {
        if (layer.source !== id) continue;
        if (realSourceLayer && layer['source-layer'] !== realSourceLayer) {
          layer['source-layer'] = realSourceLayer;
        }
        // The QLR scale ladder can put a rule below its archive's lowest tile
        // (rule at z10, archive starts z12). MapLibre never under-zooms, so the
        // layer would be blank there — clamp it up to the archive floor and let
        // the coarser scale's layer (which over-zooms fine) show through.
        if ((layer.minzoom ?? 0) < sourceMinZoom) {
          layer.minzoom = sourceMinZoom;
        }
      }
    }),
  );

  style.layers = style.layers.filter(
    (layer) =>
      (!layer.source || layer.source in style.sources) &&
      (layer.maxzoom === undefined ||
        layer.minzoom === undefined ||
        layer.maxzoom > layer.minzoom),
  );

  return style as unknown as MapLibreStyleObject;
};
