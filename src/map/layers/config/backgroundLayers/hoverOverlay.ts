import type { Map as OlMap } from 'ol';
import { hoverSources, type TileJson } from './hover';
import { createHoverLayers, type HoverStatus } from './hoverEngine';
import { getJSON, getMartinUrl } from './topoVectorStyle';

// Unlike a background this stays on the map, so it lives outside the `bg.` id prefix.
export const createHoverOverlay = async (
  olMap: OlMap,
  onStatus?: (status: HoverStatus) => void,
) => {
  const martinUrl = getMartinUrl();

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

  const overlay = createHoverLayers(olMap, martinUrl, tileJsons, onStatus);
  overlay.layer.setZIndex(1); // over the background, under markers and drawings
  return overlay;
};
