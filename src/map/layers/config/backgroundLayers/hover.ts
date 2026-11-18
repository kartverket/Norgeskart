export type Properties = Record<string, unknown>;
// type and details are keys under map.hover.types / map.hover.fields in the locales.
export type Hovered = {
  key: string;
  matches: (properties: Properties) => boolean;
  label: string;
  type: string;
  details?: [field: string, value: string][];
};
export type Band = { source: string; minzoom: number; maxzoom?: number };
export type TileJson = { minzoom?: number; maxzoom?: number };

export type HoverKind = 'fill' | 'line' | 'circle';

export type HoverGroup = {
  id: string;
  // One kind for the group, or per archive when they mix points, lines and areas.
  kind: HoverKind | ((source: string) => HoverKind);
  sources: string[];
  sourceLayer: (source: string) => string;
  color: (properties: Properties) => string;
  fillOpacity?: number;
  // Same data at several scales: use one per zoom instead of all of them at once.
  scaleBands?: boolean;
  // MapLibre zoom to start at: dense data (roads, addresses) is only useful close
  // up, and loading its tiles further out costs more than it gives.
  minzoom?: number;
  filter?: (properties: Properties) => boolean;
  // Drawn faintly while its Kartdetalj is on, where the raster map doesn't already
  // show it (protected areas, maritime borders, hazards, airports).
  display?: boolean;
  // Lower wins when groups overlap.
  rank?: (properties: Properties) => number;
  describe: (properties: Properties, zoom: number) => Hovered;
};

// These tools need the map to themselves: a highlight would cover what's being drawn.
const TOOLS_THAT_PAUSE_HOVER = [
  'draw',
  'measure',
  'extent',
  'hiking',
  'elevationProfile',
];

export const isHoverPaused = (tool: string | null) =>
  tool !== null && TOOLS_THAT_PAUSE_HOVER.includes(tool);

// MapLibre zoom (512 px tiles), the scale the tile archives and bands are cut for.
const FYLKE_MAX_ZOOM = 7;
// Martin's archives are Web Mercator; OL reprojects them to the view, whatever it is.
export const TILE_PROJECTION = 'EPSG:3857';
// Parsed tiles kept per source for placing labels: about a few screens' worth.
export const REMEMBERED_TILES = 256;
export const TRANSPARENT = 'rgba(0,0,0,0)';
// How close the cursor must be to a point symbol, in CSS pixels.
export const POINT_HIT_PX = 12;

// Coarse to fine. n100 is skipped: n50 already starts at z9, below its own band.
const PROTECTED_SCALES = ['n5000', 'n2000', 'n1000', 'n500', 'n250', 'n50'];
// In priority order: allmenninger cover whole mountain areas, so what lies inside wins.
const PROTECTED_TYPES = ['Naturvernområde', 'Skytefelt', 'Allmenning'];
const PROTECTED_COLORS: Record<string, string> = {
  Naturvernområde: '#2e7d32',
  Skytefelt: '#c62828',
  Allmenning: '#8d5a2b',
};

const text = (value: unknown) => String(value ?? '').trim();

const byProperty =
  (property: string, value: unknown) => (properties: Properties) =>
    properties[property] === value;

// Tiles carry no usable id (all 0), so name + type is the identity.
export const highlightFilter =
  (objtype: string, navn: string) => (properties: Properties) =>
    properties.objtype === objtype && properties.navn === navn;

export const kindOf = (group: Pick<HoverGroup, 'kind'>, source: string) =>
  typeof group.kind === 'function' ? group.kind(source) : group.kind;

const byLokalid = (p: Properties) => ({
  key: text(p.lokalid),
  matches: (q: Properties) => q.lokalid === p.lokalid,
});

const metres = (value: unknown) =>
  `${Number(value).toLocaleString('nb-NO', { maximumFractionDigits: 1 })} m`;

// Only signposted numbers: kommunal, private and forest road numbers are internal.
const ROAD_PREFIX: Record<string, string> = {
  E: 'E',
  R: 'Rv.',
  F: 'Fv.',
};

const ROAD_TYPES: Record<string, string> = {
  bilferje: 'Bilferje',
  bilveg: 'Veg',
  fortau: 'Fortau',
  gagate: 'Gågate',
  gangfelt: 'Gangfelt',
  gangveg: 'Gangveg',
  gatetun: 'Gatetun',
  sykkelveg: 'Sykkelveg',
  trapp: 'Trapp',
};

export const roadNumber = (p: Properties) => {
  const category = text(p.vegkategori);
  const number = text(p.vegnummer);
  const prefix = ROAD_PREFIX[category];
  if (!prefix || !number) return undefined;
  return `${prefix} ${number}`;
};

const roadType = (p: Properties) => {
  const type = text(p.typeVeg);
  return (
    ROAD_TYPES[type] ?? (type ? type[0].toUpperCase() + type.slice(1) : '')
  );
};

// Field rows for the tooltip, without empty values.
const fields = (rows: [string, unknown][]): [string, string][] =>
  rows.flatMap(([field, value]) => (text(value) ? [[field, text(value)]] : []));

const PROTECTED_TYPE_KEYS: Record<string, string> = {
  Naturvernområde: 'natureReserve',
  Skytefelt: 'firingRange',
  Allmenning: 'commons',
};

const SEA_HAZARD_TYPES: Record<string, string> = {
  Skjær: 'reef',
  Tørrfall: 'dryingArea',
  Molo: 'breakwater',
};

const SEA_HAZARD_KINDS: Record<string, HoverKind> = {
  dybdedata_skjer: 'circle',
  dybdedata_torrfall: 'fill',
  dybdedata_molo: 'line',
};

// Listed in priority order: small targets first, or the areas under them would take every hit.
export const HOVER_GROUPS: HoverGroup[] = [
  {
    id: 'airport',
    kind: 'circle',
    sources: ['n50_bygnanlegg_punkt'],
    sourceLayer: () => 'bygnanlegg_punkt',
    color: () => '#1565c0',
    filter: (p) => p.objtype === 'Lufthavn' && p.navn != null,
    display: true,
    describe: (p) => ({
      key: `airport|${text(p.navn)}`,
      matches: highlightFilter('Lufthavn', text(p.navn)),
      label: text(p.navn),
      type: 'airport',
      details: fields([
        ['iata', p.iatakode],
        ['icao', p.icaokode],
        ['owner', p.lufthavneier],
      ]),
    }),
  },
  {
    id: 'address',
    kind: 'circle',
    sources: ['matrikkelen_vegadresse'],
    sourceLayer: (source) => source,
    color: () => '#6a1b9a',
    minzoom: 15,
    describe: (p) => ({
      key: `address|${text(p.adressekode)}|${text(p.nummer)}|${text(p.bokstav)}`,
      matches: (q) =>
        q.adressekode === p.adressekode &&
        q.nummer === p.nummer &&
        q.bokstav === p.bokstav,
      label:
        `${text(p.adressenavn)} ${text(p.nummer)}${text(p.bokstav)}`.trim(),
      type: 'address',
    }),
  },
  {
    id: 'seaHazard',
    kind: (source) => SEA_HAZARD_KINDS[source] ?? 'circle',
    sources: Object.keys(SEA_HAZARD_KINDS),
    sourceLayer: (source) => source,
    color: () => '#bf360c',
    minzoom: 11,
    display: true,
    describe: (p) => ({
      ...byLokalid(p),
      key: `seaHazard|${text(p.lokalid)}`,
      label: text(p.objtype),
      type: SEA_HAZARD_TYPES[text(p.objtype)] ?? 'seaHazard',
    }),
  },
  {
    id: 'shoal',
    kind: 'circle',
    sources: ['dybdedata_grunne'],
    sourceLayer: (source) => source,
    color: () => '#01579b',
    minzoom: 12,
    describe: (p) => ({
      ...byLokalid(p),
      key: `shoal|${text(p.lokalid)}`,
      label: metres(p.dybde),
      type: 'shoal',
    }),
  },
  {
    id: 'depthContour',
    kind: 'line',
    sources: ['dybdedata_dybdekurve'],
    sourceLayer: (source) => source,
    color: () => '#0277bd',
    minzoom: 11,
    // A contour is one depth however many pieces it's drawn in.
    describe: (p) => ({
      key: `depthContour|${text(p.dybde)}`,
      matches: (q) => q.dybde === p.dybde,
      label: metres(p.dybde),
      type: 'depthContour',
    }),
  },
  // Soundings are dense: on a contour line the contour wins, between them the sounding.
  {
    id: 'sounding',
    kind: 'circle',
    sources: ['dybdedata_dybdepunkt'],
    sourceLayer: (source) => source,
    color: () => '#01579b',
    minzoom: 13,
    describe: (p) => ({
      ...byLokalid(p),
      key: `sounding|${text(p.lokalid)}`,
      label: metres(p.dybde),
      type: 'sounding',
    }),
  },
  {
    id: 'road',
    kind: 'line',
    sources: ['nvdb_veglenke'],
    sourceLayer: (source) => source,
    color: () => '#e65100',
    minzoom: 12,
    // The whole street (or numbered road) lights up, not just the link under the cursor.
    describe: (p) => {
      const name = text(p.adressenavn);
      const number = roadNumber(p);
      const details = fields([['roadType', roadType(p)]]);
      if (name) {
        return {
          key: `road|name|${name}`,
          matches: (q) => q.adressenavn === p.adressenavn,
          label: number ? `${name} (${number})` : name,
          type: 'road',
          details,
        };
      }
      if (number) {
        return {
          key: `road|number|${number}`,
          matches: (q) =>
            q.vegkategori === p.vegkategori && q.vegnummer === p.vegnummer,
          label: number,
          type: 'road',
          details,
        };
      }
      return {
        key: `road|link|${text(p.nvdbId)}`,
        matches: (q) => q.nvdbId === p.nvdbId,
        label: roadType(p),
        type: 'road',
      };
    },
  },
  {
    id: 'maritime',
    kind: 'line',
    sources: [
      'avtaltavgrensningslinje',
      'avtaltavgrensningslinjesokkel',
      'grense200nautiskemil',
      'lovvirkeomradegrense',
      'tilstotendesone',
      'yttergrensesokkel',
      'yttergrensetilstotendesone',
    ],
    sourceLayer: (source) => source,
    color: () => '#00695c',
    display: true,
    describe: (p) => {
      const name = text(p.virkeomradenavn) || text(p.objtype);
      return {
        key: `maritime|${name}`,
        matches: (q) =>
          text(p.virkeomradenavn ? q.virkeomradenavn : q.objtype) === name,
        label: name,
        type: 'maritimeBorder',
        details: p.virkeomradenavn ? fields([['kind', p.objtype]]) : undefined,
      };
    },
  },
  {
    id: 'protected',
    kind: 'fill',
    scaleBands: true,
    sources: PROTECTED_SCALES.map((s) => `${s}_restriksjonsomrader_flate`),
    sourceLayer: () => 'restriksjonsomrader_flate',
    color: (p) => PROTECTED_COLORS[text(p.objtype)] ?? '#333333',
    filter: (p) => PROTECTED_TYPES.includes(text(p.objtype)),
    rank: (p) => PROTECTED_TYPES.indexOf(text(p.objtype)),
    display: true,
    describe: (p) => ({
      key: `protected|${text(p.objtype)}|${text(p.navn)}`,
      matches: highlightFilter(text(p.objtype), text(p.navn)),
      label: text(p.navn),
      type: PROTECTED_TYPE_KEYS[text(p.objtype)] ?? 'protectedArea',
    }),
  },
  {
    id: 'kommune',
    kind: 'fill',
    fillOpacity: 0.12,
    sources: ['n50_adm_kommune_flate'],
    sourceLayer: () => 'adm_kommune_flate',
    color: () => '#37474f',
    // One source for both: zoomed out the same polygons highlight as a whole fylke.
    describe: (p, zoom) =>
      zoom < FYLKE_MAX_ZOOM
        ? {
            key: `fylke|${text(p.fylkesnummer)}`,
            matches: byProperty('fylkesnummer', p.fylkesnummer),
            label: text(p.fylkesnavn),
            type: 'county',
            details: fields([['countyNumber', p.fylkesnummer]]),
          }
        : {
            key: `kommune|${text(p.kommunenummer)}`,
            matches: byProperty('kommunenummer', p.kommunenummer),
            label: text(p.kommunenavn),
            type: 'municipality',
            details: fields([
              ['county', p.fylkesnavn],
              ['municipalityNumber', p.kommunenummer],
            ]),
          },
  },
];

export const hoverSources = () => HOVER_GROUPS.flatMap((g) => g.sources);

// One archive per zoom: coarser archives would otherwise be over-zoomed forever,
// so without a maxzoom each pixel would hit a generalized copy of the same area.
export const hoverBands = (
  group: Pick<HoverGroup, 'sources' | 'scaleBands' | 'minzoom'>,
  sources: Record<string, { minzoom?: number }>,
): Band[] => {
  const present = group.sources.filter((source) => source in sources);
  return present.map((source, i) => {
    const next = group.scaleBands ? present[i + 1] : undefined;
    return {
      source,
      minzoom: Math.max(sources[source].minzoom ?? 0, group.minzoom ?? 0),
      ...(next ? { maxzoom: sources[next].minzoom ?? 0 } : {}),
    };
  });
};

export const inBand = (band: Pick<Band, 'minzoom' | 'maxzoom'>, zoom: number) =>
  zoom >= band.minzoom && (band.maxzoom === undefined || zoom < band.maxzoom);

export const pickFeature = <
  T extends { group: HoverGroup; properties: Properties },
>(
  features: T[],
): T | undefined => {
  const score = ({ group, properties }: T) =>
    HOVER_GROUPS.indexOf(group) * 10 + (group.rank?.(properties) ?? 0);
  return [...features].sort((a, b) => score(a) - score(b))[0];
};
