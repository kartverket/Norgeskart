// Builds src/settings/map/themes/geonorgeWmsLayers.json: the Geonorge kartkatalog
// records Norgeskart can actually display. Run with `npm run geonorge-wms`.
//
// Kartkatalog protocol metadata is unreliable as a filter, so every candidate is
// verified live instead: valid WMS GetCapabilities, EPSG:25833 support, and a host
// allowed by the Caddyfile CSP (connect-src for capabilities, img-src for tiles).
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';

const API = 'https://kartkatalog.geonorge.no/api';
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src/settings/map/themes/geonorgeWmsLayers.json');
const REQUIRED_CRS = 'EPSG:25833';
const CONCURRENCY = 16;
const TIMEOUT_MS = 20000;
// Unnamed root layer: request all named children, but only up to this many.
const MAX_CHILD_LAYERS = 20;

// Nasjonal temainndeling, as used on geonorge.no/kartdata/datasett-i-geonorge/.
// Kartkatalog's `Theme` value → stable category id.
const THEME_TO_CATEGORY = {
  'Basis geodata': 'basisGeodata',
  Befolkning: 'befolkning',
  Eiendom: 'eiendom',
  Energi: 'energi',
  Flyfoto: 'flyfoto',
  Forurensning: 'forurensning',
  Friluftsliv: 'friluftsliv',
  Geologi: 'geologi',
  Høydedata: 'hoydedata',
  Kulturminner: 'kulturminner',
  'Kyst og fiskeri': 'kystOgFiskeri',
  Landbruk: 'landbruk',
  Landskap: 'landskap',
  Natur: 'natur',
  Plan: 'plan',
  Samferdsel: 'samferdsel',
  Samfunnssikkerhet: 'samfunnssikkerhet',
  'Vær og klima': 'varOgKlima',
};
const FALLBACK_CATEGORY = 'annet';
// Dataset titles beat service titles when several records share one WMS layer.
const TYPE_PRIORITY = { dataset: 0, series: 1, servicelayer: 2, service: 3 };

const xml = new XMLParser({
  ignoreAttributes: true,
  removeNSPrefix: true,
  isArray: (name) => ['Layer', 'CRS', 'SRS'].includes(name),
});

const fetchWithTimeout = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
};

const pool = async (items, fn) => {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]).catch(() => null);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return out;
};

const cspHosts = (directive) => {
  const caddy = fs.readFileSync(path.join(ROOT, 'Caddyfile'), 'utf8');
  const m = caddy.match(new RegExp(`${directive} ([^;]*)`));
  return m ? m[1].split(/\s+/).filter(Boolean) : [];
};
const hostAllowed = (host, sources) =>
  sources.some((s) =>
    s.startsWith('*.') ? host.endsWith(s.slice(1)) : s === host,
  );

// Same normalisation as normalizeWmsBaseUrl in src/map/layers/urlWms.ts.
const normalizeWmsUrl = (raw) => {
  try {
    const url = new URL(raw.trim());
    for (const key of [...url.searchParams.keys()]) {
      if (['request', 'service', 'version'].includes(key.toLowerCase())) {
        url.searchParams.delete(key);
      }
    }
    return url.toString();
  } catch {
    return null;
  }
};

const fetchCatalog = async () => {
  const records = [];
  for (let offset = 1; ; offset += 500) {
    const res = await fetchWithTimeout(
      `${API}/search?limit=500&offset=${offset}`,
    );
    const { Results = [], NumFound } = await res.json();
    records.push(...Results);
    if (Results.length === 0 || records.length >= NumFound) return records;
  }
};

// A record's WMS link lives in one of three places depending on record type.
const wmsUrlsForRecord = (r) => {
  const urls = [];
  if (r.DistributionProtocol === 'OGC:WMS') {
    urls.push(r.GetCapabilitiesUrl || r.DistributionUrl);
  }
  urls.push(r.ServiceDistributionUrlForDataset);
  // "uuid|title||type|org||protocol|url|..." — only datasets rely on this alone.
  for (const s of r.DatasetServices ?? []) {
    const f = s.split('|');
    if (f[6] === 'OGC:WMS') urls.push(f[7]);
  }
  return [...new Set(urls.filter(Boolean).map(normalizeWmsUrl))].filter(
    Boolean,
  );
};

// Servicelayer search hits don't carry their layer name; only getdata does.
const fetchServiceLayerName = async (uuid) => {
  const res = await fetchWithTimeout(`${API}/getdata/${uuid}`);
  return (await res.json())?.DistributionDetails?.Name || null;
};

const parseCapabilities = (text) => {
  const doc = xml.parse(text);
  const root = (doc.WMS_Capabilities ?? doc.WMT_MS_Capabilities)?.Capability
    ?.Layer?.[0];
  if (!root) return null;
  const layers = [];
  const crs = new Set();
  const walk = (layer) => {
    for (const c of [...(layer.CRS ?? []), ...(layer.SRS ?? [])]) {
      String(c)
        .split(/\s+/)
        .forEach((v) => crs.add(v));
    }
    if (layer.Name) {
      layers.push({ name: String(layer.Name), title: String(layer.Title) });
    }
    (layer.Layer ?? []).forEach(walk);
  };
  walk(root);
  // Topmost named layers: ArcGIS and some GeoServer groups nest unnamed folders.
  let level = root.Layer ?? [];
  while (level.length > 0 && !level.some((l) => l.Name)) {
    level = level.flatMap((l) => l.Layer ?? []);
  }
  const children = level.filter((l) => l.Name).map((l) => String(l.Name));
  return {
    rootName: root.Name ? String(root.Name) : null,
    children,
    layers,
    crs,
  };
};

const fetchCapabilities = async (url) => {
  const capUrl = new URL(url);
  capUrl.searchParams.set('SERVICE', 'WMS');
  capUrl.searchParams.set('REQUEST', 'GetCapabilities');
  return parseCapabilities(await (await fetchWithTimeout(capUrl)).text());
};

const normalizeTitle = (t) =>
  String(t)
    .toLowerCase()
    .replace(/\bwms\b/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
// GeoServer virtual services list "layer" where kartkatalog says "workspace:layer".
const stripWorkspace = (name) => name.slice(name.indexOf(':') + 1);

// Mirrors what createUrlWmsLayer would pick, but prefers a layer titled like the
// dataset and requests all topmost named layers instead of just the first one.
const resolveLayer = (record, caps, serviceLayerName) => {
  if (record.Type === 'servicelayer') {
    if (!serviceLayerName) return null;
    const match = caps.layers.find(
      (l) =>
        l.name === serviceLayerName ||
        stripWorkspace(l.name) === stripWorkspace(serviceLayerName),
    );
    return match?.name ?? null;
  }
  const title = normalizeTitle(record.Title);
  const exact = caps.layers.find((l) => normalizeTitle(l.title) === title);
  if (exact) return exact.name;
  // "Sårbare naturtyper i Sunnhordland – Svampskog" ↔ layer "Svampskog": take the
  // longest layer title contained in the dataset title (or vice versa), if unique.
  const partial = caps.layers
    .map((l) => ({ ...l, norm: normalizeTitle(l.title) }))
    .filter(
      (l) =>
        l.norm.length >= 4 &&
        (title.includes(l.norm) || l.norm.includes(title)),
    )
    .sort((a, b) => b.norm.length - a.norm.length);
  if (partial.length > 0 && partial[0].norm !== partial[1]?.norm) {
    return partial[0].name;
  }
  if (caps.rootName) return caps.rootName;
  if (caps.children.length > 0 && caps.children.length <= MAX_CHILD_LAYERS) {
    return caps.children.join(',');
  }
  return null;
};

const main = async () => {
  const connectSrc = cspHosts('connect-src');
  const imgSrc = cspHosts('img-src');

  console.log('Fetching kartkatalog…');
  const records = await fetchCatalog();
  const candidates = records
    .map((r) => ({ record: r, urls: wmsUrlsForRecord(r) }))
    .filter((c) => c.urls.length > 0);
  console.log(
    `${records.length} records, ${candidates.length} with a WMS link`,
  );

  const allUrls = [...new Set(candidates.flatMap((c) => c.urls))];
  const usableUrls = allUrls.filter((u) => {
    const { protocol, hostname } = new URL(u);
    return (
      protocol === 'https:' &&
      hostAllowed(hostname, connectSrc) &&
      hostAllowed(hostname, imgSrc)
    );
  });
  console.log(
    `${allUrls.length} unique WMS URLs, ${usableUrls.length} allowed by CSP; probing…`,
  );
  const capsList = await pool(usableUrls, fetchCapabilities);
  const capsByUrl = new Map();
  usableUrls.forEach((u, i) => {
    if (capsList[i]?.crs.has(REQUIRED_CRS)) capsByUrl.set(u, capsList[i]);
  });
  console.log(`${capsByUrl.size} WMS URLs valid with ${REQUIRED_CRS}`);

  const serviceLayers = candidates.filter(
    (c) =>
      c.record.Type === 'servicelayer' && c.urls.some((u) => capsByUrl.has(u)),
  );
  const layerNames = await pool(
    serviceLayers.map((c) => c.record.Uuid),
    fetchServiceLayerName,
  );
  const layerNameByUuid = new Map(
    serviceLayers.map((c, i) => [c.record.Uuid, layerNames[i]]),
  );

  const byKey = new Map();
  for (const { record, urls } of candidates) {
    const url = urls.find((u) => capsByUrl.has(u));
    if (!url) continue;
    const layer = resolveLayer(
      record,
      capsByUrl.get(url),
      layerNameByUuid.get(record.Uuid),
    );
    if (!layer) continue;
    const entry = {
      id: record.Uuid,
      title: record.Title.trim(),
      organization: record.Organization ?? '',
      category: THEME_TO_CATEGORY[record.Theme] ?? FALLBACK_CATEGORY,
      url,
      layer,
      detailsUrl: record.ShowDetailsUrl ?? null,
      type: record.Type,
    };
    const key = `${url}|${layer}`;
    const existing = byKey.get(key);
    if (
      !existing ||
      (TYPE_PRIORITY[entry.type] ?? 9) < (TYPE_PRIORITY[existing.type] ?? 9)
    ) {
      byKey.set(key, entry);
    }
  }

  const layers = [...byKey.values()].sort(
    (a, b) =>
      a.category.localeCompare(b.category) ||
      a.title.localeCompare(b.title, 'nb'),
  );
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      { generated: new Date().toISOString().slice(0, 10), layers },
      null,
      2,
    ) + '\n',
  );
  const perCategory = Object.groupBy(layers, (l) => l.category);
  console.log(`Wrote ${layers.length} layers to ${path.relative(ROOT, OUT)}`);
  for (const [cat, list] of Object.entries(perCategory)) {
    console.log(`  ${cat}: ${list.length}`);
  }
};

await main();
