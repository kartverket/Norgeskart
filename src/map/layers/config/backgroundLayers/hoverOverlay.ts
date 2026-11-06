import type { StyleSpecification } from 'maplibre-gl';
import { getEnv } from '../../../../env';
import { createMapLibreLayer } from './createMapLibreLayer';
import { enableHover, hoverSources } from './hover';
import { getJSON, getMartinUrl } from './topoVectorStyle';

type TileJson = { minzoom?: number; maxzoom?: number };

export const buildHoverStyle = (
  martinUrl: string,
  styleBaseUrl: string,
  tileJsons: Record<string, TileJson>,
): StyleSpecification => ({
  version: 8,
  glyphs: `${styleBaseUrl}/glyphs/{fontstack}/{range}.pbf`,
  sources: Object.fromEntries(
    Object.entries(tileJsons).map(([id, { minzoom, maxzoom }]) => [
      id,
      {
        type: 'vector',
        tiles: [`${martinUrl}/${id}/{z}/{x}/{y}`],
        minzoom: minzoom ?? 0,
        maxzoom: maxzoom ?? 22,
      },
    ]),
  ),
  // No base layers: hover draws on an otherwise transparent canvas.
  layers: [],
});

// Unlike a background this stays on the map, so it lives outside the `bg.` id prefix.
export const createHoverOverlay = async () => {
  const martinUrl = getMartinUrl();
  const { styleBaseUrl } = getEnv().layerProviderParameters.topoVectorMartin;

  // Groups whose archive isn't published yet are skipped, so they appear once it is.
  const catalog = (await getJSON(`${martinUrl}/catalog`)) as {
    tiles?: Record<string, unknown>;
  };
  const available = hoverSources().filter((id) => id in (catalog.tiles ?? {}));
  if (available.length === 0) return null;

  // Martin's replicas re-list the bucket on separate timers, so an archive in the
  // catalog can still be missing on the next request. Skip it, don't lose all hover.
  const results = await Promise.allSettled(
    available.map(async (id) => [
      id,
      (await getJSON(`${martinUrl}/${id}`)) as TileJson,
    ]),
  );
  const tileJsons = Object.fromEntries(
    results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : [])),
  );
  if (Object.keys(tileJsons).length === 0) return null;

  const layer = createMapLibreLayer(
    { style: buildHoverStyle(martinUrl, styleBaseUrl, tileJsons) },
    'overlay.hover',
    true,
    {},
  );
  layer.setZIndex(1); // over the background, under markers and drawings
  enableHover(layer);
  return layer;
};
