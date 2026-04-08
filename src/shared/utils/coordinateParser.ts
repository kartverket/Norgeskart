import i18n from 'i18next';
import { ProjectionIdentifier } from '../../map/projections/types';

export interface ParsedCoordinate {
  lat: number;
  lon: number;
  projection: ProjectionIdentifier;
  formattedString: string;
  inputFormat: 'decimal' | 'dms' | 'utm';
}

const applyDirection = (value: number, dir: string): number =>
  dir === 'S' || dir === 'W' ? -value : value;

const assignLatLon = (
  val1: number,
  dir1: string,
  val2: number,
  dir2: string,
): { lat: number; lon: number } => {
  if (dir1 === 'N' || dir1 === 'S') {
    return { lat: applyDirection(val1, dir1), lon: applyDirection(val2, dir2) };
  }
  return { lon: applyDirection(val1, dir1), lat: applyDirection(val2, dir2) };
};

/** Norway UTM rough bounding box (easting 0–1 200 000, northing 5 000 000–9 000 000) */
const isValidUTMRange = (east: number, north: number): boolean =>
  east >= -100000 && east <= 1200000 && north >= 5000000 && north <= 9000000;

const isSupportedEpsgCode = (code: number): boolean =>
  code === 4326 ||
  code === 3857 ||
  code === 4230 ||
  (code >= 25832 && code <= 25836) ||
  (code >= 23031 && code <= 23036) ||
  (code >= 27391 && code <= 27398);

const formatDMS = (value: number, isLat: boolean): string => {
  const abs = Math.abs(value);
  const degrees = Math.floor(abs);
  const minutes = Math.floor((abs - degrees) * 60);
  const seconds = ((abs - degrees - minutes / 60) * 3600).toFixed(1);
  const direction = isLat ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
  return `${degrees}°${minutes}'${seconds}"${direction}`;
};

const createDMSResult = (lat: number, lon: number): ParsedCoordinate => ({
  lat,
  lon,
  projection: 'EPSG:4326',
  formattedString: `${formatDMS(lat, true)} ${formatDMS(lon, false)}`,
  inputFormat: 'dms',
});

const validateAndReturnDMS = (
  lat: number,
  lon: number,
): ParsedCoordinate | null =>
  Math.abs(lat) <= 90 && Math.abs(lon) <= 180
    ? createDMSResult(lat, lon)
    : null;

const normalizeDirections = (input: string): string =>
  input
    .replace(/Nord|NORD|North|NORTH/g, 'N')
    .replace(/Sør|SØR|Syd|SYD|South|SOUTH/g, 'S')
    .replace(/Øst|ØST|Ost|OST|East|EAST|Ø/g, 'E')
    .replace(/Vest|VEST|West|WEST/g, 'W');

const normalizeDecimalSeparators = (input: string): string => {
  // Convert European decimal commas to dots, e.g. "60,135106" → "60.135106"
  // but leave commas that act as coordinate separators intact.
  //
  // Examples that must convert:  "60,135106, 10,618917" → "60.135106, 10.618917"
  //                               "60,13,10,61"         → "60.13,10.61"
  // Examples that must NOT convert: "500000,7000000", "60,10" (two coords)

  const shortPatterns = input.match(/\d,\d{1,2}(?=,|;|\s|@|$)/g) ?? [];
  const hasMultipleShortPatterns = shortPatterns.length >= 2;

  return input.replace(/(\d),(\d+)/g, (match, before, after, offset, str) => {
    const textBefore = str.slice(0, offset + 1);
    const numberBeforeComma = textBefore.match(/[\d.]+$/);

    // Number before comma already has a dot → comma is a coordinate separator
    if (numberBeforeComma?.[0].includes('.')) return match;

    // Both sides are large numbers (≥ 1 000) → coordinate separator
    if (numberBeforeComma) {
      const fullBefore = parseInt(numberBeforeComma[0], 10);
      const fullAfter = parseInt(after, 10);
      if (fullBefore >= 1000 && fullAfter >= 1000) return match;
    }

    // 3+ digits after comma → definitely European decimal
    if (after.length >= 3) return `${before}.${after}`;

    // 1–2 digits: convert when context makes it unambiguous
    if (hasMultipleShortPatterns) return `${before}.${after}`;

    const rest = str.slice(offset + match.length);
    if (/^[,;]\s*\d|^\s+\d|^@/.test(rest)) return `${before}.${after}`;

    return match;
  });
};

/**
 * Parses coordinate input from search query and detects format.
 * Supports:
 * - Decimal degrees: "59.91273, 10.74609", "lat: 59.91273, lon: 10.74609"
 * - DMS / DM: "59°54'45.8\"N 10°44'45.9\"E", "60° 50.466' N, 04° 52.535' E"
 * - UTM: "598515, 6643994", "east: 598515, north: 6643994", "33W 598515 6643994"
 * - Explicit EPSG: "425917 7730314@25833", "59.91273, 10.74609@4326"
 * - Norwegian direction words: "60 Nord, 10 Øst"
 *
 * @param input - The coordinate string to parse
 * @param fallbackProjection - Projection to use as tie-breaker for ambiguous projected coords
 */
export const parseCoordinateInput = (
  input: string,
  fallbackProjection?: ProjectionIdentifier,
): ParsedCoordinate | null => {
  if (!input || input.trim().length === 0) return null;

  const trimmedInput = input.trim();

  if (trimmedInput.includes('@')) {
    // Explicit EPSG — return result or null, never fall through to other parsers
    return parseWithEPSG(
      normalizeDecimalSeparators(normalizeDirections(trimmedInput)),
    );
  }

  const normalizedInput = normalizeDecimalSeparators(
    normalizeDirections(trimmedInput),
  );

  return (
    parseDecimalDegrees(normalizedInput) ??
    parseDMS(normalizedInput) ??
    parseUTM(normalizedInput, fallbackProjection)
  );
};

/**
 * Parse coordinates with explicit EPSG code.
 * Examples: "425917 7730314@25834", "59.91273, 10.74609@4326", "163834.01,6663030.01@EPSG:25833"
 */
const parseWithEPSG = (input: string): ParsedCoordinate | null => {
  const atIndex = input.indexOf('@');
  if (atIndex === -1) return null;

  const coordsPart = input.slice(0, atIndex).trim();
  const epsgPart = input.slice(atIndex + 1).trim();

  const epsgMatch = epsgPart.match(/^(?:EPSG:)?(\d{4,5})$/i);
  if (!epsgMatch) return null;

  const rawCode = parseInt(epsgMatch[1], 10);
  const epsgCode = rawCode === 4258 ? 4326 : rawCode; // Normalize EPSG:4258 → 4326

  if (!isSupportedEpsgCode(epsgCode)) return null;

  const projection = `EPSG:${epsgCode}` as ProjectionIdentifier;
  const translationKey = `map.settings.layers.projection.projections.${projection.replace(':', '').toLowerCase()}.displayName`;
  const translated = i18n.t(translationKey);
  const formatName = translated.startsWith(
    'map.settings.layers.projection.projections',
  )
    ? projection
    : translated;

  // Strip common label prefixes, then split into two numbers
  const coordsCleaned = coordsPart
    .replace(
      /\b(lat|latitude|lon|lng|longitude|north|northing|nord|east|easting|øst|ost)\b[\s:=]*/gi,
      '',
    )
    .replace(/\b[xy]\b[\s:=]*/gi, '')
    .trim();

  const coordParts = coordsCleaned.split(/[,;\s]+/).filter(Boolean);
  if (coordParts.length !== 2) return null;

  const coord1 = parseFloat(coordParts[0]);
  const coord2 = parseFloat(coordParts[1]);
  if (isNaN(coord1) || isNaN(coord2)) return null;

  if (epsgCode === 4326) {
    // Geographic: coord1 = lat, coord2 = lon
    return {
      lat: coord1,
      lon: coord2,
      projection,
      formattedString: `${coord1.toFixed(5)}, ${coord2.toFixed(5)} (${formatName})`,
      inputFormat: 'decimal',
    };
  }

  // Projected: coord1 = easting, coord2 = northing
  return {
    lat: coord2,
    lon: coord1,
    projection,
    formattedString: `${formatName}: ${coord1.toFixed(0)}E ${coord2.toFixed(0)}N`,
    inputFormat: 'utm',
  };
};

/**
 * Parse decimal degrees format.
 * Examples: "59.91273, 10.74609", "lat: 59.91273, lon: 10.74609",
 *           "59.9494° N, 10.7564° E", "60° N, 10° E"
 */
const parseDecimalDegrees = (input: string): ParsedCoordinate | null => {
  // Match decimal degrees with optional degree symbol and direction
  // e.g. "59.9494° N, 10.7564° E" or "N 60°, E 10°"
  // Skip if input has minute markers — that's DMS, not decimal degrees
  if (!/['\u2032]/.test(input)) {
    const degreePattern =
      /([NSEW])?\s*(\d+(?:\.\d+)?)\s*°\s*([NSEW])?[\s,;]+([NSEW])?\s*(\d+(?:\.\d+)?)\s*°\s*([NSEW])?/i;
    const m = input.match(degreePattern);

    if (m) {
      const num1 = parseFloat(m[2]);
      const num2 = parseFloat(m[5]);

      if (!isNaN(num1) && !isNaN(num2)) {
        const dir1 = (m[1] ?? m[3])?.toUpperCase();
        const dir2 = (m[4] ?? m[6])?.toUpperCase();

        let lat: number, lon: number;
        if (dir1 === 'N' || dir1 === 'S') {
          lat = dir1 === 'S' ? -num1 : num1;
          lon = dir2 === 'W' ? -num2 : num2;
        } else if (dir1 === 'E' || dir1 === 'W') {
          lon = dir1 === 'W' ? -num1 : num1;
          lat = dir2 === 'S' ? -num2 : num2;
        } else {
          lat = num1;
          lon = num2;
        }

        if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
          return {
            lat,
            lon,
            projection: 'EPSG:4326',
            formattedString: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
            inputFormat: 'decimal',
          };
        }
      }
    }
  }

  // If input has both ° and minute/second markers, let parseDMS handle it
  if (/°/.test(input) && /['\u2032"\u2033]/.test(input)) return null;
  // "°digit" (e.g. "66°45.005 N") is DM/DMS format
  if (/°\d/.test(input)) return null;

  // Strip common label prefixes
  const cleaned = input
    .toLowerCase()
    .replace(/\b(lat|latitude|nord|north|n)[\s:=]*/gi, '')
    .replace(/\b(lon|lng|longitude|øst|ost|east|e)[\s:=]*/gi, '')
    .trim();

  const parts = cleaned.split(/[,;\s]+/).filter(Boolean);
  if (parts.length !== 2) return null;

  const num1 = parseFloat(parts[0]);
  const num2 = parseFloat(parts[1]);
  if (isNaN(num1) || isNaN(num2)) return null;

  const isLatLon =
    Math.abs(num1) <= 90 &&
    Math.abs(num2) <= 180 &&
    (Math.abs(num1) < 80 || Math.abs(num2) < 80);

  if (!isLatLon) return null;

  return {
    lat: num1,
    lon: num2,
    projection: 'EPSG:4326',
    formattedString: `${num1.toFixed(5)}, ${num2.toFixed(5)}`,
    inputFormat: 'decimal',
  };
};

/**
 * Parse DMS (Degrees, Minutes, Seconds) and DM (Degrees, decimal Minutes) formats.
 * Handles direction before or after, with or without direction letters.
 * Examples: "59°54'45.8\"N 10°44'45.9\"E", "60° 50.466' N, 04° 52.535' E",
 *           "N 60° 5' 38'', E 10° 50' 10''", "N 60° 44.077 E 011° 15.943"
 */
const parseDMS = (input: string): ParsedCoordinate | null => {
  // Pattern 1: Direction BEFORE, DMS — "N 60° 5' 38'', E 10° 50' 10''"
  const dirBeforeDMSPattern =
    /([NSEW])\s*(\d+)\s*°\s*(\d+)\s*['\u2032]\s*(\d+(?:\.\d+)?)\s*["\u2033']{0,2}\s*[,;\s]*([NSEW])\s*(\d+)\s*°\s*(\d+)\s*['\u2032]\s*(\d+(?:\.\d+)?)\s*["\u2033']{0,2}/i;
  const m1 = input.match(dirBeforeDMSPattern);
  if (m1) {
    const [, d1, deg1, min1, sec1, d2, deg2, min2, sec2] = m1;
    const m = parseInt(min1, 10),
      s = parseFloat(sec1);
    const m2 = parseInt(min2, 10),
      s2 = parseFloat(sec2);
    if (m < 60 && s < 60 && m2 < 60 && s2 < 60) {
      const val1 = parseInt(deg1, 10) + m / 60 + s / 3600;
      const val2 = parseInt(deg2, 10) + m2 / 60 + s2 / 3600;
      const { lat, lon } = assignLatLon(
        val1,
        d1.toUpperCase(),
        val2,
        d2.toUpperCase(),
      );
      return validateAndReturnDMS(lat, lon);
    }
  }

  // Pattern 2: Direction BEFORE, DM — "N 60° 44.077 E 011° 15.943"
  const dirBeforeDMPattern =
    /([NSEW])\s*(\d+)\s*°\s*(\d+(?:\.\d+)?)['\u2032]?[,;\s]+([NSEW])\s*(\d+)\s*°\s*(\d+(?:\.\d+)?)['\u2032]?/i;
  const m2 = input.match(dirBeforeDMPattern);
  if (m2) {
    const [, d1, deg1, min1, d2, deg2, min2] = m2;
    const mm1 = parseFloat(min1),
      mm2 = parseFloat(min2);
    if (mm1 < 60 && mm2 < 60) {
      const val1 = parseInt(deg1, 10) + mm1 / 60;
      const val2 = parseInt(deg2, 10) + mm2 / 60;
      const { lat, lon } = assignLatLon(
        val1,
        d1.toUpperCase(),
        val2,
        d2.toUpperCase(),
      );
      return validateAndReturnDMS(lat, lon);
    }
  }

  // Pattern 3: DMS without direction — "60°10'10,10°10'10" or "60° 14' 18.306\", 9° 55' 45.113\""
  const dmsNoDirectionPattern =
    /(\d+)\s*°\s*(\d+)\s*['\u2032]\s*(\d+(?:\.\d+)?)\s*["\u2033]{0,2}\s*[,;\s]+(\d+)\s*°\s*(\d+)\s*['\u2032]\s*(\d+(?:\.\d+)?)/;
  const m3 = input.match(dmsNoDirectionPattern);
  if (m3) {
    const [, deg1, min1, sec1, deg2, min2, sec2] = m3;
    const mm1 = parseInt(min1, 10),
      ss1 = parseFloat(sec1);
    const mm2 = parseInt(min2, 10),
      ss2 = parseFloat(sec2);
    if (mm1 < 60 && ss1 < 60 && mm2 < 60 && ss2 < 60) {
      const lat = parseInt(deg1, 10) + mm1 / 60 + ss1 / 3600;
      const lon = parseInt(deg2, 10) + mm2 / 60 + ss2 / 3600;
      return validateAndReturnDMS(lat, lon);
    }
  }

  // Pattern 4: DM without direction — "60°10.5',10°10.5'"
  const dmNoDirectionPattern =
    /(\d+)\s*°\s*(\d+(?:\.\d+)?)\s*['\u2032]\s*[,;\s]+(\d+)\s*°\s*(\d+(?:\.\d+)?)\s*['\u2032]/;
  const m4 = input.match(dmNoDirectionPattern);
  if (m4) {
    const [, deg1, min1, deg2, min2] = m4;
    const mm1 = parseFloat(min1),
      mm2 = parseFloat(min2);
    if (mm1 < 60 && mm2 < 60) {
      const lat = parseInt(deg1, 10) + mm1 / 60;
      const lon = parseInt(deg2, 10) + mm2 / 60;
      return validateAndReturnDMS(lat, lon);
    }
  }

  // Pattern 5: DM with only first direction — "58° 09.83' N, 06° 48.76'"
  const dmPartialDirectionPattern =
    /(\d+)\s*°\s*(\d+(?:\.\d+)?)\s*['\u2032]\s*([NSEW])\s*[,;\s]+(\d+)\s*°\s*(\d+(?:\.\d+)?)\s*['\u2032]?\s*$/i;
  const m5 = input.match(dmPartialDirectionPattern);
  if (m5) {
    const [, deg1, min1, d1, deg2, min2] = m5;
    const dir1 = d1.toUpperCase();
    const mm1 = parseFloat(min1),
      mm2 = parseFloat(min2);
    if (mm1 < 60 && mm2 < 60) {
      const val1 = parseInt(deg1, 10) + mm1 / 60;
      const val2 = parseInt(deg2, 10) + mm2 / 60;
      const lat =
        dir1 === 'N' || dir1 === 'S' ? applyDirection(val1, dir1) : val2;
      const lon =
        dir1 === 'E' || dir1 === 'W' ? applyDirection(val1, dir1) : val2;
      return validateAndReturnDMS(lat, lon);
    }
  }

  // Pattern 6: DMS with direction AFTER — "59°54'45.8\"N 10°44'45.9\"E"
  const dmsAfterPattern =
    /(\d+)[°\s]+(\d+)['\u2032'\s]+(\d+(?:\.\d+)?)["\u2033"']{0,2}\s*([NSEW])/gi;
  let matches = Array.from(input.matchAll(dmsAfterPattern));

  // Pattern 7: DM with direction AFTER — "60° 50.466' N, 04° 52.535' E"
  if (matches.length !== 2) {
    const dmAfterPattern = /(\d+)[°\s]+(\d+(?:\.\d+)?)['\u2032'\s]*([NSEW])/gi;
    matches = Array.from(input.matchAll(dmAfterPattern));
    if (matches.length !== 2) return null;
  }

  const isDMS = matches[0].length === 5; // DMS match has 5 groups (index 1-4)
  let lat: number | null = null;
  let lon: number | null = null;

  for (const match of matches) {
    const degrees = parseInt(match[1], 10);
    const minutesValue = parseFloat(match[2]);
    let decimal: number;
    let direction: string;

    if (isDMS) {
      const minutes = Math.floor(minutesValue);
      const seconds = parseFloat(match[3]);
      direction = match[4].toUpperCase();
      if (isNaN(minutes) || isNaN(seconds) || minutes >= 60 || seconds >= 60) {
        return null;
      }
      decimal = degrees + minutes / 60 + seconds / 3600;
    } else {
      direction = match[3].toUpperCase();
      if (isNaN(minutesValue) || minutesValue >= 60) return null;
      decimal = degrees + minutesValue / 60;
    }

    if (isNaN(degrees)) return null;

    if (direction === 'N' || direction === 'S') {
      lat = applyDirection(decimal, direction);
    } else if (direction === 'E' || direction === 'W') {
      lon = applyDirection(decimal, direction);
    }
  }

  if (lat === null || lon === null) return null;
  return createDMSResult(lat, lon);
};

/**
 * Parse projected coordinates (UTM or Web Mercator).
 * Examples: "598515, 6643994", "east: 598515, north: 6643994", "33W 598515 6643994"
 * Assumes UTM zone 33N (EPSG:25833) for Norway unless a zone or fallback is specified.
 *
 * @param input - The coordinate string to parse
 * @param fallbackProjection - Projection to prefer when coordinates are ambiguous
 */
const parseUTM = (
  input: string,
  fallbackProjection?: ProjectionIdentifier,
): ParsedCoordinate | null => {
  // Detect "Northing N, Easting E" order from explicit direction letters
  const directionPattern =
    /(\d+(?:\.\d+)?)\s*([NE])\s*[,;]\s*(\d+(?:\.\d+)?)\s*([NE])/i;
  const dirMatch = input.match(directionPattern);
  const firstIsNorthing = dirMatch?.at(2)?.toUpperCase() === 'N';

  // Strip common label prefixes
  const cleaned = input
    .toLowerCase()
    .replace(/(^|[\s,;:=])(east|easting|øst|ost|e)[\s:=]*/gi, '$1')
    .replace(/(^|[\s,;:=])(north|northing|nord|n)[\s:=]*/gi, '$1')
    .replace(/(^|[\s,;:=])(zone|sone|utm)[\s:=]*/gi, '$1')
    .replace(/[()]/g, '')
    .trim();

  const parts = cleaned.split(/[,;\s]+/).filter(Boolean);
  if (parts.length < 2) return null;

  // Extract explicit zone from first or last token
  let zone: number | null = null;
  let numStartIdx = 0;
  let explicitZone = false;

  const tryExtractZone = (token: string): number | null => {
    // Short zone format: "33", "33N", "33W", "W33"
    const zoneMatch = token.match(/^([A-Z]?)(\d{1,2})([A-Z]?)$/i);
    if (zoneMatch) return parseInt(zoneMatch[2], 10);
    // 5-digit EPSG: 32633 or 25833
    const epsgMatch = token.match(/^(\d{5})$/);
    if (epsgMatch) {
      const code = parseInt(epsgMatch[1], 10);
      if (code >= 32632 && code <= 32636) return code - 32600;
      if (code >= 25832 && code <= 25836) return code - 25800;
    }
    return null;
  };

  if (parts.length >= 3) {
    const fromFirst = tryExtractZone(parts[0]);
    if (fromFirst !== null) {
      zone = fromFirst;
      numStartIdx = 1;
      explicitZone = true;
    } else {
      const fromLast = tryExtractZone(parts[parts.length - 1]);
      if (fromLast !== null) {
        zone = fromLast;
        explicitZone = true;
      }
    }
  }

  const coord1 = parseFloat(parts[numStartIdx]);
  const coord2 = parseFloat(parts[numStartIdx + 1]);
  if (isNaN(coord1) || isNaN(coord2)) return null;

  // Resolve east/north from coordinate order
  let east: number, north: number;
  if (firstIsNorthing) {
    north = coord1;
    east = coord2;
  } else if (coord1 > 1000000 && coord2 < 1000000) {
    // First number is clearly northing (> 1 M), second is easting
    north = coord1;
    east = coord2;
  } else {
    east = coord1;
    north = coord2;
  }

  // Resolve projection
  let projection: ProjectionIdentifier;
  let projectionName: string;

  if (explicitZone && zone !== null) {
    if (!isValidUTMRange(east, north)) return null;

    const zoneMap: Record<number, [ProjectionIdentifier, string]> = {
      32: ['EPSG:25832', 'UTM 32N'],
      33: ['EPSG:25833', 'UTM 33N'],
      34: ['EPSG:25834', 'UTM 34N'],
      35: ['EPSG:25835', 'UTM 35N'],
      36: ['EPSG:25836', 'UTM 36N'],
    };
    const entry = zoneMap[zone] ?? ['EPSG:25833', 'UTM 33N'];
    [projection, projectionName] = entry;
  } else if (fallbackProjection?.startsWith('EPSG:258')) {
    if (!isValidUTMRange(east, north)) return null;
    projection = fallbackProjection;
    const zoneNum = parseInt(fallbackProjection.replace('EPSG:258', ''), 10);
    zone = zoneNum;
    projectionName = `UTM ${zone}N`;
  } else if (fallbackProjection === 'EPSG:3857') {
    const looksLikeUTM = isValidUTMRange(east, north);
    const looksLikeWebMercator =
      east >= 400000 &&
      east <= 4000000 &&
      north >= 7000000 &&
      north <= 12000000;
    if (looksLikeUTM && !looksLikeWebMercator) return null;
    if (
      east < -20037509 ||
      east > 20037509 ||
      north < -20037509 ||
      north > 20037509
    ) {
      return null;
    }
    projection = 'EPSG:3857';
    projectionName = 'Web Mercator';
  } else {
    // Default: UTM 33N
    if (!isValidUTMRange(east, north)) return null;
    projection = 'EPSG:25833';
    zone = 33;
    projectionName = 'UTM 33N';
  }

  return {
    lat: north,
    lon: east,
    projection,
    formattedString: `${projectionName}: ${east.toFixed(0)}E ${north.toFixed(0)}N`,
    inputFormat: 'utm',
  };
};

export const isLikelyLonLatSwap = (parsed: ParsedCoordinate): boolean => {
  if (parsed.projection !== 'EPSG:4326') return false;
  const { lat, lon } = parsed;
  return lat > 0 && lat < 45 && lon > 50 && lon < 90;
};
