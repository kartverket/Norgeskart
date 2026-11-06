import type { StyleSpecification } from 'maplibre-gl';
import { getEnv } from '../../../../env';
import { createMapLibreLayer } from './createMapLibreLayer';
import { enableTopoVectorHover, hoverSources } from './topoVectorHover';

export const buildHoverStyle = (
  martinUrl: string,
  styleBaseUrl: string,
  tileJsons: Record<string, { minzoom?: number; maxzoom?: number }>,
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
  // No base layers: hover draws on an otherwise transparent canvas over the raster.
  layers: [],
});

// Unlike a background this stays on the map, so it lives outside the `bg.` id prefix.
export const createHoverOverlay = async () => {
  const { baseUrl, styleBaseUrl } =
    getEnv().layerProviderParameters.topoVectorMartin;

  const entries = await Promise.all(
    hoverSources().map(async (id) => {
      const response = await fetch(`${baseUrl}/${id}`);
      return response.ok ? ([id, await response.json()] as const) : null;
    }),
  );
  const tileJsons = Object.fromEntries(entries.filter((e) => e !== null));
  if (Object.keys(tileJsons).length === 0) return null;

  const layer = createMapLibreLayer(
    { style: buildHoverStyle(baseUrl, styleBaseUrl, tileJsons) },
    'overlay.hover',
    true,
    {},
  );
  layer.setZIndex(1); // over the background, under markers and drawings
  enableTopoVectorHover(layer);
  return layer;
};
