import { applyStyle } from 'ol-mapbox-style';
import Feature from 'ol/Feature';
import MVT from 'ol/format/MVT';
import VectorTileLayer from 'ol/layer/VectorTile';
import { get as getProjection } from 'ol/proj';
import VectorTileSource from 'ol/source/VectorTile';
import { createXYZ } from 'ol/tilegrid';
import TileGrid from 'ol/tilegrid/TileGrid';
import TileState from 'ol/TileState';
import VectorTile from 'ol/VectorTile';
import { clipFeaturesToExtent, withOutlineStrokes } from './ogcTileClip';
import type { ThemeLayerDefinition } from './themeLayerConfigApi';

// OGC API - Styles: GET /collections/{id}/styles lists the styles, each with a
// `stylesheet` link to a MapLibre style (f=mbs). The style's own source is the
// WebMercatorQuad tileset; when OGC API - Tiles offers a tileset in the map's
// CRS we render the same style layers on that instead (no reprojection).

type Link = { rel: string; href: string; type?: string };

interface OgcStyleList {
  default?: string;
  styles: { id: string; links?: Link[] }[];
}

interface OgcTilesetList {
  links?: Link[];
  tilesets?: { crs?: string; links?: Link[] }[];
}

interface TileMatrixSet {
  id: string;
  orderedAxes?: string[];
  tileMatrices: {
    id: string;
    cellSize: number;
    pointOfOrigin: [number, number];
    tileWidth: number;
    tileHeight: number;
    matrixWidth: number;
    matrixHeight: number;
  }[];
}

const TILING_SCHEME_REL =
  'http://www.opengis.net/def/rel/ogc/1.0/tiling-scheme';

// pygeoapi advertises no zoom limits (no tileMatrixSetLimits, TileJSON is not
// implemented for MVT-postgresql); requests past the provider max 404, so the
// grid stops here and OL overzooms
const DEFAULT_MAX_ZOOM = 14;

// MapLibre zoom z ≙ Web Mercator 512 px resolution; scaled by cos(lat) it is
// the true ground resolution, so minzoom/maxzoom keep their visual meaning in
// UTM. 60°N ≈ southern Norway, where most of the data and users are.
const STYLE_RESOLUTIONS = Array.from(
  { length: 25 },
  (_, z) => (78271.51696402048 * Math.cos((60 * Math.PI) / 180)) / 2 ** z,
);

const WEBFONTS =
  // Google Fonts is already allowed by the CSP; the default is jsDelivr
  'https://fonts.googleapis.com/css?family={Font+Family}:{fontweight}';

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
};

// pygeoapi returns some links path-relative and unencoded (style ids may hold spaces/æøå)
const absolute = (href: string, apiUrl: string) =>
  new URL(encodeURI(decodeURI(href)), `${apiUrl}/`).toString();

const crsUriToCode = (uri: string | undefined) => {
  const match = uri?.match(/\/EPSG\/0\/(\d+)$/);
  return match ? `EPSG:${match[1]}` : undefined;
};

const resolveStylesheetUrl = async (
  apiUrl: string,
  collection: string,
  styleId: string | undefined,
): Promise<string> => {
  const list = await fetchJson<OgcStyleList>(
    `${apiUrl}/collections/${encodeURIComponent(collection)}/styles?f=json`,
  );
  const wantedId = styleId ?? list.default ?? list.styles[0]?.id;
  const style = list.styles.find((s) => s.id === wantedId);
  const href = style?.links?.find((l) => l.rel === 'stylesheet')?.href;
  if (!href) {
    throw new Error(
      `No stylesheet link for style "${wantedId}" in ${collection}`,
    );
  }
  return absolute(href, apiUrl);
};

const buildTileGrid = (tms: TileMatrixSet, maxZoom: number) => {
  const matrices = tms.tileMatrices
    .filter((m) => Number(m.id) <= maxZoom)
    .sort((a, b) => Number(a.id) - Number(b.id));
  const northingFirst = ['Y', 'N', 'NORTHING', 'LAT'].includes(
    tms.orderedAxes?.[0]?.toUpperCase() ?? '',
  );
  // Same tiles, drawn as 512 px like MapLibre does: OL picks one zoom level
  // lower, so a quarter of the requests and of the per-tile polygon labels
  return new TileGrid({
    minZoom: Number(matrices[0].id),
    resolutions: matrices.map((m) => m.cellSize / 2),
    origins: matrices.map(({ pointOfOrigin: [a, b] }) =>
      northingFirst ? [b, a] : [a, b],
    ),
    sizes: matrices.map((m) => [m.matrixWidth, m.matrixHeight]),
    tileSizes: matrices.map((m) => [m.tileWidth * 2, m.tileHeight * 2]),
  });
};

// A VectorTileSource on the collection's tileset in `projection`, or null
const findNativeTileSource = async (
  apiUrl: string,
  collection: string,
  projection: string,
  maxZoom: number,
): Promise<VectorTileSource | null> => {
  const list = await fetchJson<OgcTilesetList>(
    `${apiUrl}/collections/${encodeURIComponent(collection)}/tiles?f=json`,
  );
  const tileset = list.tilesets?.find(
    (t) => crsUriToCode(t.crs) === projection,
  );
  const tmsHref = tileset?.links?.find(
    (l) => l.rel === TILING_SCHEME_REL,
  )?.href;
  const itemTemplate = list.links?.find(
    (l) => l.rel === 'item' && l.href.includes('{tileMatrixSetId}'),
  )?.href;
  if (!tmsHref || !itemTemplate) {
    return null;
  }

  const tms = await fetchJson<TileMatrixSet>(absolute(tmsHref, apiUrl));
  const url = new URL(itemTemplate, `${apiUrl}/`).href
    .replace(/%7B/g, '{')
    .replace(/%7D/g, '}')
    .replace('{tileMatrixSetId}', tms.id)
    // OL tile rows count down from the top-left origin, like OGC tileRow
    .replace('{tileMatrix}', '{z}')
    .replace('{tileRow}', '{y}')
    .replace('{tileCol}', '{x}');

  return new VectorTileSource({
    format: new MVT(),
    url,
    projection,
    tileGrid: buildTileGrid(tms, maxZoom),
  });
};

// The style's own WebMercatorQuad tiles for a map in another CRS. Each tile
// is clipped to its exact extent before OL reprojects it (see ogcTileClip)
const createReprojectedTileSource = (url: string, maxZoom: number) => {
  const format = new MVT<Feature>({ featureClass: Feature });
  return new VectorTileSource({
    format,
    url,
    projection: 'EPSG:3857',
    // 512 px like MapLibre (see buildTileGrid)
    tileGrid: createXYZ({
      extent: getProjection('EPSG:3857')!.getExtent(),
      tileSize: 512,
      maxZoom,
    }),
    tileLoadFunction: (tile, src) => {
      const vectorTile = tile as VectorTile<Feature>;
      vectorTile.setLoader(async (extent, _resolution, projection) => {
        try {
          const response = await fetch(src);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          // pygeoapi answers 204 for empty tiles
          const features =
            response.status === 204
              ? []
              : format.readFeatures(await response.arrayBuffer(), {
                  extent,
                  featureProjection: projection,
                });
          const clipped = clipFeaturesToExtent(features, extent);
          // OL ignores the returned promise; setFeatures does the work
          vectorTile.setFeatures(clipped);
          return clipped;
        } catch {
          vectorTile.setState(TileState.ERROR);
          return [];
        }
      });
    },
  });
};

const applyOgcStyle = async (
  layer: VectorTileLayer,
  layerDef: ThemeLayerDefinition,
  apiUrl: string,
  collection: string,
  mapProjection: string,
) => {
  const maxZoom = layerDef.ogcMaxZoom ?? DEFAULT_MAX_ZOOM;
  const styleUrl = await resolveStylesheetUrl(
    apiUrl,
    collection,
    layerDef.ogcStyleId,
  );
  const [glStyle, nativeSource] = await Promise.all([
    fetchJson<{ sources: Record<string, { type: string; tiles?: string[] }> }>(
      styleUrl,
    ),
    findNativeTileSource(apiUrl, collection, mapProjection, maxZoom),
  ]);
  const sourceId = Object.keys(glStyle.sources).find(
    (id) => glStyle.sources[id].type === 'vector',
  );
  const tilesUrl = sourceId && glStyle.sources[sourceId].tiles?.[0];
  if (!nativeSource && !tilesUrl) {
    throw new Error(`No usable tile source in ${styleUrl}`);
  }

  layer.setSource(
    nativeSource ?? createReprojectedTileSource(tilesUrl!, maxZoom),
  );
  await applyStyle(layer, glStyle, {
    source: sourceId,
    updateSource: false,
    styleUrl,
    webfonts: WEBFONTS,
    // The default resolutions are Web Mercator's own
    ...(mapProjection !== 'EPSG:3857' && { resolutions: STYLE_RESOLUTIONS }),
  });
  if (!nativeSource) {
    layer.setStyle(
      withOutlineStrokes(layer.getStyleFunction()!, 'EPSG:3857', mapProjection),
    );
  }
};

export const createOgcStyleThemeLayer = (
  layerDef: ThemeLayerDefinition,
  mapProjection: string,
): VectorTileLayer | null => {
  const { ogcApiUrl, ogcCollection } = layerDef;
  if (!ogcApiUrl || !ogcCollection) {
    console.warn(`Layer ${layerDef.id} is missing ogcApiUrl/ogcCollection`);
    return null;
  }

  const layer = new VectorTileLayer({
    declutter: true,
    properties: {
      id: `theme.${layerDef.id}`,
      layerTitle: layerDef.name.nb || layerDef.id,
    },
  });

  applyOgcStyle(layer, layerDef, ogcApiUrl, ogcCollection, mapProjection).catch(
    (err) =>
      console.error(`Could not apply OGC API style for ${layerDef.id}`, err),
  );

  return layer;
};
