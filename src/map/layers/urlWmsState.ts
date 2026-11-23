import type TileLayer from 'ol/layer/Tile';
import { getWmsBaseUrl, getWmsLayerNames } from './urlWms';

// ?geonorge=<id>,<id>~<layer>~<layer> — first id on top, "~" = chosen sublayers.

/** Catalog ids are mostly UUIDs, but e.g. met.no uses "no.met.adc:<uuid>". */
const ID_PATTERN = /^[\w.:-]{1,200}$/;
const MAX_TOKENS = 20;

export const isGeonorgeId = (id: string) => ID_PATTERN.test(id);

export type GeonorgeToken = { id: string; layers?: string[] };

const decode = (text: string) => {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
};

export const parseGeonorgeParam = (
  param: string | null | undefined,
): GeonorgeToken[] => {
  const tokens = new Map<string, GeonorgeToken>();
  for (const part of (param ?? '').split(',')) {
    const [id, ...layers] = part.trim().split('~');
    if (!isGeonorgeId(id) || tokens.has(id)) continue;
    const names = layers.map(decode).filter(Boolean);
    tokens.set(id, { id, ...(names.length > 0 ? { layers: names } : {}) });
  }
  return [...tokens.values()].slice(0, MAX_TOKENS);
};

export const formatGeonorgeToken = ({ id, layers = [] }: GeonorgeToken) =>
  [
    id,
    // encodeURIComponent leaves "~" alone.
    ...layers.map((l) => encodeURIComponent(l).replace(/~/g, '%7E')),
  ].join('~');

/** URL state for the active layers: catalog layers by id, the rest by address. */
export const serializeUrlWmsLayers = (layers: TileLayer[]) => {
  const geonorge: string[] = [];
  const wmsUrls: string[] = [];
  for (const layer of layers) {
    const names = getWmsLayerNames(layer);
    const id = layer.get('geonorgeId') as string | undefined;
    if (id) {
      const isDefault = names.join(',') === layer.get('defaultLayers');
      geonorge.push(
        formatGeonorgeToken({ id, layers: isDefault ? undefined : names }),
      );
    } else {
      const url = new URL(getWmsBaseUrl(layer));
      url.searchParams.set('LAYERS', names.join(','));
      wmsUrls.push(url.toString());
    }
  }
  return { geonorge, wmsUrls };
};
