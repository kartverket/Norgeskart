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
// Some capabilities are huge (wms.nib-mosaikk is ~16 MB) and 20 s wasn't enough.
const TIMEOUT_MS = 60000;
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
const DATASET_TYPES = { dataset: true, series: true };

const xml = new XMLParser({
  // Only Layer@queryable matters; other attributes would turn text nodes like
  // <Title xml:lang="…"> into objects.
  ignoreAttributes: (name) => name !== 'queryable',
  removeNSPrefix: true,
  isArray: (name) => ['Layer', 'CRS', 'SRS'].includes(name),
});

// Some servers (kart.dirmin.no) answer Node's default "node" User-Agent with a
// 404 but serve anything else, so identify the script explicitly.
const USER_AGENT = 'norgeskart-geonorge-wms-generator';

const fetchWithTimeout = async (url) => {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'User-Agent': USER_AGENT },
  });
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

// Empty (GeoServer's <Title/>) or generic ("WMS") titles don't name anything.
const usefulTitle = (t) => {
  const title = String(t ?? '').trim();
  return /^(wms|ows|wms service|geoserver web map service)?$/i.test(title)
    ? ''
    : title;
};

// GetFeatureInfo formats Norgeskart's featureInfoService can parse, best first.
// Servers answer anything else with an exception (NVE rejects application/json
// but offers application/geo+json), so pick from what the service advertises.
const INFO_FORMAT_PREFERENCE = [
  'application/json',
  'application/geo+json',
  'application/vnd.ogc.gml',
  'text/xml',
  'text/plain',
  'text/html',
];
const pickInfoFormat = (capability) => {
  const gfi = capability?.Request?.GetFeatureInfo;
  if (!gfi) return null;
  const offered = new Set([gfi.Format ?? []].flat().map(String));
  return INFO_FORMAT_PREFERENCE.find((f) => offered.has(f)) ?? null;
};

const parseCapabilities = (text) => {
  const doc = xml.parse(text);
  const caps = doc.WMS_Capabilities ?? doc.WMT_MS_Capabilities;
  const root = caps?.Capability?.Layer?.[0];
  if (!root) return null;
  const layers = [];
  const crs = new Set();
  // Scale limits (WMS 1.3 Min/MaxScaleDenominator) inherit from the parent.
  // Returns the range in which the layer actually draws something.
  const walk = (layer, inherited) => {
    for (const c of [...(layer.CRS ?? []), ...(layer.SRS ?? [])]) {
      String(c)
        .split(/\s+/)
        .forEach((v) => crs.add(v));
    }
    const own = {
      min: Number(layer.MinScaleDenominator ?? inherited.min),
      max: Number(layer.MaxScaleDenominator ?? inherited.max),
    };
    // A group only draws its children: its range is theirs, clipped by any
    // explicit limit on the group (MarinGrenseWMS4 has none, all children stop
    // at 1:150 000). A leaf keeps its own, inherited range.
    const childResults = (layer.Layer ?? []).map((child) => walk(child, own));
    const childRanges = childResults;
    const range =
      childRanges.length === 0
        ? own
        : {
            min: Math.max(own.min, Math.min(...childRanges.map((r) => r.min))),
            max: Math.min(own.max, Math.max(...childRanges.map((r) => r.max))),
          };
    // Queryable if it or anything below it is: a group answers for its children.
    const queryable =
      layer['@_queryable'] === '1' ||
      layer['@_queryable'] === 1 ||
      childResults.some((r) => r.queryable);
    if (layer.Name) {
      layers.push({
        name: String(layer.Name),
        title: String(layer.Title ?? ''),
        isRoot: layer === root,
        minScale: range.min,
        maxScale: range.max,
        queryable,
      });
    }
    return { ...range, queryable };
  };
  walk(root, { min: 0, max: Infinity });
  // Topmost named layers: ArcGIS and some GeoServer groups nest unnamed folders.
  let level = root.Layer ?? [];
  while (level.length > 0 && !level.some((l) => l.Name)) {
    level = level.flatMap((l) => l.Layer ?? []);
  }
  const children = level.filter((l) => l.Name).map((l) => String(l.Name));
  return {
    serviceTitle: usefulTitle(caps.Service?.Title) || usefulTitle(root.Title),
    infoFormat: pickInfoFormat(caps.Capability),
    rootName: root.Name ? String(root.Name) : null,
    children,
    layers,
    crs,
  };
};

// Retried: a single slow response otherwise silently drops every layer of a
// service from the list, making regenerated output flap between runs.
const CAPABILITIES_ATTEMPTS = 3;
const fetchCapabilities = async (url) => {
  const capUrl = new URL(url);
  capUrl.searchParams.set('SERVICE', 'WMS');
  capUrl.searchParams.set('REQUEST', 'GetCapabilities');
  for (let attempt = 1; ; attempt++) {
    try {
      return parseCapabilities(await (await fetchWithTimeout(capUrl)).text());
    } catch (e) {
      if (attempt >= CAPABILITIES_ATTEMPTS) throw e;
    }
  }
};

const normalizeTitle = (t) =>
  String(t)
    .toLowerCase()
    .replace(/\bwms\b/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
// GeoServer virtual services list "layer" where kartkatalog says "workspace:layer".
const stripWorkspace = (name) => name.slice(name.indexOf(':') + 1);

// Topmost named layer(s), i.e. the whole service — what createUrlWmsLayer would
// pick without an explicit layer, except all top-level layers instead of the first.
const wholeServiceLayer = (caps) => {
  if (caps.rootName) return caps.rootName;
  if (caps.children.length > 0 && caps.children.length <= MAX_CHILD_LAYERS) {
    return caps.children.join(',');
  }
  return null;
};

// Returns { layer, match } where match is how the layer was found: 'name'
// (servicelayer metadata), 'title'/'partial' (dataset title ↔ layer), or 'whole'.
// Kartkatalog records no layer name for datasets, so titles are all we have.
const resolveLayer = (record, caps, serviceLayerName) => {
  if (record.Type === 'servicelayer') {
    if (!serviceLayerName) return null;
    const match = caps.layers.find(
      (l) =>
        l.name === serviceLayerName ||
        stripWorkspace(l.name) === stripWorkspace(serviceLayerName),
    );
    return match ? { layer: match.name, match: 'name' } : null;
  }
  if (record.Type === 'service') {
    const layer = wholeServiceLayer(caps);
    if (layer) return { layer, match: 'whole' };
    // Too many top-level layers to request at once: fall through to the
    // title match below, like a dataset.
  }
  const title = normalizeTitle(record.Title);
  // Layer names count too: "Landsnettpunkt", "Svenske_finske_stasjoner".
  const exact = caps.layers.find(
    (l) =>
      normalizeTitle(l.title) === title ||
      normalizeTitle(stripWorkspace(l.name)) === title,
  );
  if (exact) return { layer: exact.name, match: 'title' };
  // "Sårbare naturtyper i Sunnhordland – Svampskog" ↔ layer "Svampskog": take the
  // longest layer title contained in the dataset title (or vice versa), if unique.
  // The root is excluded: its title is often just the owner ("Kartverket"), which
  // would sneak the whole service back in under a dataset's title.
  const partial = caps.layers
    .filter((l) => !l.isRoot)
    .map((l) => ({ ...l, norm: normalizeTitle(l.title) }))
    .filter(
      (l) =>
        l.norm.length >= 4 &&
        (title.includes(l.norm) || l.norm.includes(title)),
    )
    .sort((a, b) => b.norm.length - a.norm.length);
  if (partial.length > 0 && partial[0].norm !== partial[1]?.norm) {
    return { layer: partial[0].name, match: 'partial' };
  }
  if (record.Type === 'service') return null;
  const layer = wholeServiceLayer(caps);
  return layer ? { layer, match: 'whole' } : null;
};

// "Sårbare marine biotoper – modellert utbredelse Svampskog" + "… Svampspikelbunn"
// → "Sårbare marine biotoper – modellert utbredelse". Used to name a service that
// has neither a catalog record nor a <Title> of its own.
const MIN_COMMON_TITLE_LENGTH = 8;
const commonTitlePrefix = (titles) => {
  // A single title has itself as "common prefix" — that's the subset name again.
  if (titles.length < 2) return null;
  let prefix = titles[0];
  for (const t of titles.slice(1)) {
    while (!t.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  // Cut back to a word boundary and drop dangling separators.
  prefix = /\s/.test(titles[0]?.[prefix.length] ?? ' ')
    ? prefix
    : prefix.replace(/\S*$/, '');
  prefix = prefix.replace(/[\s\-–—:,(]+$/u, '').trim();
  return prefix.length >= MIN_COMMON_TITLE_LENGTH ? prefix : null;
};

// Visible scale range of the requested layer(s), or {} when unlimited. Lets the
// app tell users to zoom in instead of showing an empty map (NVE "Dam" draws only
// below 1:75 000).
const scaleRange = (caps, layerParam) => {
  const requested = new Set(layerParam.split(','));
  const hits = caps.layers.filter((l) => requested.has(l.name));
  if (hits.length === 0) return {};
  const min = Math.min(...hits.map((l) => l.minScale));
  const max = Math.max(...hits.map((l) => l.maxScale));
  return {
    ...(min > 0 ? { minScale: Math.round(min) } : {}),
    ...(Number.isFinite(max) ? { maxScale: Math.round(max) } : {}),
  };
};

// Layers that only draw zoomed in (NVE "Dam", below 1:75 000) look broken to
// most users. If the service also has an overview variant of the same layer
// ("Dam_N250"), that is the better default; the detailed one is kept as its own
// entry.
const OVERVIEW_MAX_SCALE = 1_000_000;
const findOverviewVariant = (caps, layerName) => {
  const layer = caps.layers.find((l) => l.name === layerName);
  if (!layer || !(layer.maxScale < OVERVIEW_MAX_SCALE)) return null;
  const base = stripWorkspace(layer.name).toLowerCase();
  const title = normalizeTitle(layer.title);
  const [best] = caps.layers
    .filter(
      (l) =>
        l !== layer &&
        // Must actually show at overview scales, not just be named "_oversikt".
        l.maxScale >= OVERVIEW_MAX_SCALE &&
        (stripWorkspace(l.name).toLowerCase().startsWith(`${base}_`) ||
          normalizeTitle(l.title).startsWith(`${title} `)),
    )
    .sort((a, b) => b.maxScale - a.maxScale || a.name.length - b.name.length);
  return best ?? null;
};

// WMS layer titles/abstracts are mostly technical ("Dam_N250"); the catalog
// abstract says what the data is. Keep its first sentence, capped for the list.
const SUMMARY_MAX_LENGTH = 180;
const summarize = (text) => {
  const clean = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return null;
  const [sentence] = clean.split(/(?<=[.!?])\s/);
  if (sentence.length <= SUMMARY_MAX_LENGTH) return sentence;
  return `${sentence.slice(0, SUMMARY_MAX_LENGTH).replace(/\s+\S*$/, '')}…`;
};

// Servers reject GetFeatureInfo on layers their capabilities mark
// queryable="0" (Kartverket's raster/background maps); don't send it at all.
const isQueryable = (caps, layerParam) => {
  const requested = new Set(layerParam.split(','));
  return caps.layers.some((l) => requested.has(l.name) && l.queryable);
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

  // A dataset that falls back to the whole service is only an honest entry when
  // it is the service's sole dataset; otherwise it's one subset among several
  // (e.g. "Fastmerker - Høydefastmerker" on the shared fastmerker2 service).
  const datasetsByUrl = new Map();
  for (const { record, urls } of candidates) {
    if (!(record.Type in DATASET_TYPES)) continue;
    const url = urls.find((u) => capsByUrl.has(u));
    if (url)
      datasetsByUrl.set(url, [...(datasetsByUrl.get(url) ?? []), record]);
  }
  // Every service a dataset links to — one dataset often spans many services
  // (HI publishes one per substance), so the first URL alone misses most.
  const datasetsByAnyUrl = new Map();
  for (const { record, urls } of candidates) {
    if (!(record.Type in DATASET_TYPES)) continue;
    for (const url of urls.filter((u) => capsByUrl.has(u))) {
      datasetsByAnyUrl.set(url, [...(datasetsByAnyUrl.get(url) ?? []), record]);
    }
  }
  const datasetTitles = (url) =>
    (datasetsByUrl.get(url) ?? []).map((r) => r.Title.trim());

  // Geonorge's category pages (geonorge.no/kartdata/datasett-i-geonorge/) filter
  // on the *dataset* theme. Service and servicelayer themes are set separately
  // and are often off (HI's "Dieldrin i marine sedimenter" layer says Geologi,
  // its dataset says Natur), so services take the theme of their datasets.
  const categoryFor = (record, url) => {
    const datasets =
      record.Type in DATASET_TYPES ? [] : (datasetsByAnyUrl.get(url) ?? []);
    const themes = datasets.length > 0 ? datasets : [record];
    const [theme] = Object.entries(
      Object.groupBy(themes, (r) => r.Theme ?? ''),
    ).sort((a, b) => b[1].length - a[1].length)[0];
    return THEME_TO_CATEGORY[theme] ?? FALLBACK_CATEGORY;
  };

  const byKey = new Map();
  const stats = {};
  const droppedByUrl = new Map();
  const add = (entry) => {
    const key = `${entry.url}|${entry.layer}`;
    const existing = byKey.get(key);
    if (
      !existing ||
      (TYPE_PRIORITY[entry.type] ?? 9) < (TYPE_PRIORITY[existing.type] ?? 9)
    ) {
      byKey.set(key, entry);
    }
  };
  for (const { record, urls } of candidates) {
    const url = urls.find((u) => capsByUrl.has(u));
    if (!url) continue;
    const resolved = resolveLayer(
      record,
      capsByUrl.get(url),
      layerNameByUuid.get(record.Uuid),
    );
    if (!resolved) continue;
    if (
      resolved.match === 'whole' &&
      record.Type in DATASET_TYPES &&
      datasetTitles(url).length > 1
    ) {
      stats.droppedSharedWhole = (stats.droppedSharedWhole ?? 0) + 1;
      droppedByUrl.set(url, [...(droppedByUrl.get(url) ?? []), record]);
      continue;
    }
    stats[resolved.match] = (stats[resolved.match] ?? 0) + 1;
    const caps = capsByUrl.get(url);
    const entry = {
      id: record.Uuid,
      title: record.Title.trim(),
      organization: record.Organization ?? '',
      category: categoryFor(record, url),
      url,
      layer: resolved.layer,
      ...scaleRange(caps, resolved.layer),
      summary: summarize(record.Abstract),
      detailsUrl: record.ShowDetailsUrl ?? null,
      type: record.Type,
      ...(isQueryable(caps, resolved.layer) ? {} : { queryable: false }),
      ...(resolved.match === 'whole' ? { whole: true } : {}),
    };
    const overview =
      resolved.match !== 'whole' && findOverviewVariant(caps, resolved.layer);
    if (overview) {
      stats.overviewDefault = (stats.overviewDefault ?? 0) + 1;
      add({
        ...entry,
        layer: overview.name,
        ...scaleRange(caps, overview.name),
      });
      add({ ...entry, id: `${record.Uuid}:detailed`, variant: 'detailed' });
    } else {
      add(entry);
    }
  }

  // Keep the dropped datasets' data reachable: if no catalog service record
  // already covers the whole service, add one titled by the service itself.
  for (const [url, dropped] of droppedByUrl) {
    const caps = capsByUrl.get(url);
    const layer = wholeServiceLayer(caps);
    const title = caps.serviceTitle || commonTitlePrefix(datasetTitles(url));
    if (!layer || byKey.has(`${url}|${layer}`) || !title) continue;
    stats.syntheticWhole = (stats.syntheticWhole ?? 0) + 1;
    add({
      id: `service:${url}`,
      title,
      organization: dropped[0].Organization ?? '',
      category: categoryFor({ Type: 'service' }, url),
      url,
      layer,
      ...scaleRange(caps, layer),
      summary: null,
      detailsUrl: null,
      type: 'service',
      ...(isQueryable(caps, layer) ? {} : { queryable: false }),
      whole: true,
    });
  }
  console.log('Layer resolution:', stats);

  // One header per WMS in the UI, so users see which layers belong together.
  // Title: the catalog's service record ("Vannkraft WMS") reads better than the
  // server's own <Title> ("Vannkraft1").
  const serviceRecords = new Map();
  for (const { record, urls } of candidates) {
    if (record.Type !== 'service') continue;
    const url = urls.find((u) => capsByUrl.has(u));
    if (url && !serviceRecords.has(url)) serviceRecords.set(url, record);
  }
  const entriesByUrl = Object.groupBy(byKey.values(), (e) => e.url);
  const services = {};
  for (const [url, entries] of Object.entries(entriesByUrl)) {
    const record = serviceRecords.get(url);
    const { organization } = entries[0];
    // HI publishes one WMS per layer without a catalog service record; there the
    // layer's own title ("… Dieldrin-nivåer WMS") is the service's name.
    const soleTitle =
      new Set(entries.map((e) => e.title)).size === 1
        ? entries[0].title.replace(/\s*[-–]?\s*WMS$/i, '')
        : null;
    services[url] = {
      title:
        record?.Title.trim() ||
        capsByUrl.get(url).serviceTitle ||
        commonTitlePrefix(datasetTitles(url)) ||
        soleTitle ||
        new URL(url).hostname,
      organization: record?.Organization ?? organization,
      summary: summarize(record?.Abstract),
      detailsUrl: record?.ShowDetailsUrl ?? null,
      // null: no GetFeatureInfo at all, so clicking the map shouldn't query it.
      infoFormat: capsByUrl.get(url).infoFormat,
    };
  }

  const layers = [...byKey.values()].sort(
    (a, b) =>
      a.category.localeCompare(b.category) ||
      a.title.localeCompare(b.title, 'nb'),
  );
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      { generated: new Date().toISOString().slice(0, 10), services, layers },
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
