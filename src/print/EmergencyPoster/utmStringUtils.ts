import { Coordinate } from 'ol/coordinate';
import { transform } from 'ol/proj';

export type LonLat = readonly [lon: number, lat: number];
export type XY = readonly [x: number, y: number];

export type Hemisphere = 'N' | 'S';

/** UTM/MGRS latitude band letter (C..X excluding I, O). Empty if outside [-80, 84]. */
export type UtmBand =
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | ''; // empty when lat < -80 || lat > 84

export interface UtmInfo {
  zone: number; // 1..60
  band: UtmBand; // '' if outside UTM latitude range
  hemisphere: Hemisphere; // 'N' or 'S'
  epsg: number; // 326xx or 327xx
}

export interface FormatOptions {
  /** Number of decimals for easting/northing. Default: 0 (nearest meter). */
  decimals?: 0 | 1 | 2 | 3;
  /** Use thin space thousands separators (nb-NO style). Default: false. */
  thousands?: boolean;
  /** Override projection used to compute E/N (e.g., force 32632). Default: derived from lon/lat. */
  forceEpsg?: number;
}

export interface FormattedUtm {
  info: UtmInfo;
  easting: number; // numeric (rounded to `decimals`)
  northing: number; // numeric (rounded to `decimals`)
  eastingStr: string; // formatted with decimals/thousands
  northingStr: string; // formatted with decimals/thousands
  /** Final label, e.g., "Sone 35W Ø 616092 N 7733906" */
  label: string;
}

/* ------------------------------ Helper logic ------------------------------ */

function normalizeLon(lon: number): number {
  return ((((lon + 180) % 360) + 360) % 360) - 180; // [-180, 180)
}

export function utmZoneFromLongitude(lon: number): number {
  const normalized = normalizeLon(lon);
  return Math.floor((normalized + 180) / 6) + 1; // 1..60
}

/** Latitude band letter for UTM/MGRS. Returns '' if outside [-80, 84]. */
export function utmLatBand(lat: number): UtmBand {
  const bands = 'CDEFGHJKLMNPQRSTUVWX'; // 20 letters
  if (lat < -80 || lat > 84) return '';
  const idx = Math.floor((lat + 80) / 8);
  return bands[idx] as UtmBand;
}

/** Apply Norway & Svalbard exceptions for GZD (zone number may be overridden) */
export function utmZoneWithExceptions(lon: number, lat: number): number {
  let zone = utmZoneFromLongitude(lon);

  // Norway exception: 56N–64N and 3E–12E => force zone 32
  if (lat >= 56 && lat < 64 && lon >= 3 && lon < 12) {
    zone = 32;
  }

  // Svalbard exception: 72N–84N with widened zones
  if (lat >= 72 && lat < 84) {
    if (lon >= 0 && lon < 9) zone = 31;
    else if (lon >= 9 && lon < 21) zone = 33;
    else if (lon >= 21 && lon < 33) zone = 35;
    else if (lon >= 33 && lon < 42) zone = 37;
  }

  return zone;
}

/** Compute UTM info (zone, band, hemisphere, EPSG) from lon/lat. */
export function utmInfoFromLonLat(lon: number, lat: number): UtmInfo {
  const zone = utmZoneWithExceptions(lon, lat);
  const band = utmLatBand(lat);
  const hemisphere: Hemisphere = lat >= 0 ? ('N' as const) : ('S' as const);
  const epsg = hemisphere === 'N' ? 32600 + zone : 32700 + zone;
  return { zone, band, hemisphere, epsg };
}

/* --------------------------- Formatting utilities ------------------------- */

function roundTo(value: number, decimals: number): number {
  if (!decimals) return Math.round(value);
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

function formatNumber(
  value: number,
  decimals: 0 | 1 | 2 | 3,
  thousands: boolean,
): string {
  if (!thousands) {
    return value.toFixed(decimals).replace(/^-0(\.0+)?$/, '0');
  }
  // nb-NO uses space as thousands separator and comma as decimal sep.
  // We’ll standardize to thin space for readability and keep dot decimals as in your example.
  const parts = value.toFixed(decimals).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');
  return parts.length === 2 ? `${intPart}.${parts[1]}` : intPart;
}

/* --------------------------- Main formatting API -------------------------- */

/**
 * Transform a coordinate to UTM and format as:
 *   "Sone {zone}{band} Ø {E} N {N}"
 *
 * Overloads:
 * - If input CRS is UTM (EPSG:326xx/327xx), the function still computes canonical zone/band from WGS84.
 * - decimals default to 0; thousands default to false.
 */
export function formatToNorwegianUTMString(
  coord: Coordinate,
  sourceCRS: string,
): string;
export function formatToNorwegianUTMString(
  coord: Coordinate,
  sourceCRS: string,
  options: FormatOptions,
): string;
export function formatToNorwegianUTMString(
  coord: Coordinate,
  sourceCRS: string,
  options: FormatOptions = {},
): string {
  const { label } = formatToNorwegianUTM(coord, sourceCRS, options);
  return label;
}

/**
 * Same as `formatToNorwegianUTMString`, but returns a structured result with
 * both numeric values and the final string.
 */
export function formatToNorwegianUTM(
  coord: Coordinate,
  sourceCRS: string,
  options: FormatOptions = {},
): FormattedUtm {
  const { decimals = 0, thousands = false, forceEpsg } = options;

  // 1) Transform to lon/lat (EPSG:4326)
  const [lon, lat] = transform(
    [coord[0], coord[1]],
    sourceCRS,
    'EPSG:4326',
  ) as [number, number];

  // 2) Determine UTM info
  const baseInfo = utmInfoFromLonLat(lon, lat);

  // 3) Use forced EPSG if provided (rare), otherwise derived from lon/lat
  const utmEpsgNum = forceEpsg ?? baseInfo.epsg;
  const utmEpsgStr = `EPSG:${utmEpsgNum}`;

  // 4) Transform lon/lat -> UTM meters
  const [E, N] = transform([lon, lat], 'EPSG:4326', utmEpsgStr) as [
    number,
    number,
  ];

  // 5) Round & format
  const easting = roundTo(E, decimals);
  const northing = roundTo(N, decimals);
  const eastingStr = formatNumber(easting, decimals, thousands);
  const northingStr = formatNumber(northing, decimals, thousands);

  const label = `Sone ${baseInfo.zone}${baseInfo.band} Ø ${eastingStr} N ${northingStr}`;

  return {
    info: baseInfo,
    easting,
    northing,
    eastingStr,
    northingStr,
    label,
  };
}
