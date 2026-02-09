import { ProjectionIdentifier } from '../../map/atoms';

export interface ParsedCoordinate {
  lat: number;
  lon: number;
  projection: ProjectionIdentifier;
  formattedString: string;
  inputFormat: 'decimal' | 'dms' | 'utm';
}

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

const normalizeDirections = (input: string): string => {
  return input
    .replace(/Nord|NORD|North|NORTH/g, 'N')
    .replace(/Sør|SØR|Syd|SYD|South|SOUTH/g, 'S')
    .replace(/Øst|ØST|Ost|OST|East|EAST|Ø/g, 'E')
    .replace(/Vest|VEST|West|WEST/g, 'W');
};

const normalizeDecimalSeparators = (input: string): string => {
  let result = input;
  // Pattern: digit,digits followed by ", " or end of string or space+digit
  // This catches European decimals like "60,135106, 10,618917"
  result = result.replace(/(\d),(\d+)(?=,\s|\s|$)/g, '$1.$2');

  return result;
};

/**
 * Parses coordinate input from search query and detects format
 * Supports:
 * - Decimal degrees: "59.91273, 10.74609" or "lat: 59.91273, lon: 10.74609"
 * - DMS: "59°54'45.8\"N 10°44'45.9\"E"
 * - UTM: "598515, 6643994" or "east: 598515, north: 6643994"
 * - EPSG specified: "425917 7730314@25833" or "59.91273, 10.74609@4326"
 * - Norwegian words: "60 Nord, 10 Øst"
 *
 * @param input - The coordinate string to parse
 * @param fallbackProjection - Optional projection to use as fallback when coordinates are ambiguous
 */
export const parseCoordinateInput = (
  input: string,
  fallbackProjection?: ProjectionIdentifier,
): ParsedCoordinate | null => {
  if (!input || input.trim().length === 0) {
    return null;
  }

  const normalizedInput = normalizeDecimalSeparators(
    normalizeDirections(input.trim()),
  );
  const trimmedInput = normalizedInput;

  const epsgResult = parseWithEPSG(trimmedInput);
  if (epsgResult) {
    return epsgResult;
  }

  const decimalResult = parseDecimalDegrees(trimmedInput);
  if (decimalResult) {
    return decimalResult;
  }

  const dmsResult = parseDMS(trimmedInput);
  if (dmsResult) {
    return dmsResult;
  }

  const utmResult = parseUTM(trimmedInput, fallbackProjection);
  if (utmResult) {
    return utmResult;
  }

  return null;
};

/**
 * Parse coordinates with explicit EPSG code
 * Examples: "425917 7730314@25833", "59.91273, 10.74609@4326", "598515 6643994@25832"
 */
const parseWithEPSG = (input: string): ParsedCoordinate | null => {
  if (!input.includes('@')) {
    return null;
  }

  const parts = input.split('@');
  if (parts.length !== 2) {
    return null;
  }

  const coordsPart = parts[0].trim();
  const epsgPart = parts[1].trim();

  const epsgMatch = epsgPart.match(/^(\d{4,5})$/);
  if (!epsgMatch) {
    return null;
  }

  const epsgCode = parseInt(epsgMatch[1], 10);

  let projection: ProjectionIdentifier;
  let formatName: string;

  switch (epsgCode) {
    case 4326:
      projection = 'EPSG:4326';
      formatName = 'WGS84';
      break;
    case 4258:
      projection = 'EPSG:4326'; // Use 4326 as fallback for ETRS89
      formatName = 'ETRS89';
      break;
    case 25832:
      projection = 'EPSG:25832';
      formatName = 'UTM 32N';
      break;
    case 25833:
      projection = 'EPSG:25833';
      formatName = 'UTM 33N';
      break;
    case 25834:
      projection = 'EPSG:25834';
      formatName = 'UTM 34N';
      break;
    case 25835:
      projection = 'EPSG:25835';
      formatName = 'UTM 35N';
      break;
    case 25836:
      projection = 'EPSG:25836';
      formatName = 'UTM 36N';
      break;
    case 3857:
      projection = 'EPSG:3857';
      formatName = 'Web Mercator';
      break;
    default:
      return null;
  }

  // Parse coordinates
  const coordsCleaned = coordsPart
    .toLowerCase()
    .replace(
      /\b(lat|latitude|nord|north|n|x|east|easting|øst|ost|e)[\s:=]*/gi,
      '',
    )
    .replace(/\b(lon|lng|longitude|y|north|northing|n)[\s:=]*/gi, '')
    .trim();

  const coordParts = coordsCleaned.split(/[,;\s]+/).filter((p) => p.length > 0);

  if (coordParts.length !== 2) {
    return null;
  }

  const coord1 = parseFloat(coordParts[0]);
  const coord2 = parseFloat(coordParts[1]);

  if (isNaN(coord1) || isNaN(coord2)) {
    return null;
  }

  // Determine input format based on EPSG and coordinate values
  let inputFormat: 'decimal' | 'dms' | 'utm';
  let formattedString: string;
  let lat: number, lon: number;

  if (epsgCode === 4326 || epsgCode === 4258) {
    // Geographic coordinates (lat/lon) - first is lat, second is lon
    inputFormat = 'decimal';
    lat = coord1;
    lon = coord2;
    formattedString = `${lat.toFixed(5)}, ${lon.toFixed(5)} (${formatName})`;
  } else {
    // Projected coordinates (UTM, Web Mercator, etc.) - first is easting, second is northing
    inputFormat = 'utm';
    lon = coord1; // easting
    lat = coord2; // northing
    formattedString = `${formatName}: ${coord1.toFixed(0)}E ${coord2.toFixed(0)}N`;
  }

  return {
    lat,
    lon,
    projection,
    formattedString,
    inputFormat,
  };
};

/**
 * Parse decimal degrees format
 * Examples: "59.91273, 10.74609", "lat: 59.91273, lon: 10.74609", "59.91273; 10.74609"
 * Examples with degree symbol: "59.9494° N, 10.7564° E", "60° N, 10° E"
 */
const parseDecimalDegrees = (input: string): ParsedCoordinate | null => {
  // First try to match decimal degrees with degree symbol and optional direction
  // Examples: "59.9494° N, 10.7564° E" or "60° N, 10° E"
  const degreePattern =
    /([NSEW])?\s*(\d+(?:\.\d+)?)\s*°\s*([NSEW])?[\s,;]+([NSEW])?\s*(\d+(?:\.\d+)?)\s*°\s*([NSEW])?/i;
  const degreeMatch = input.match(degreePattern);

  if (degreeMatch) {
    const dir1Before = degreeMatch[1]?.toUpperCase();
    const num1 = parseFloat(degreeMatch[2]);
    const dir1After = degreeMatch[3]?.toUpperCase();
    const dir2Before = degreeMatch[4]?.toUpperCase();
    const num2 = parseFloat(degreeMatch[5]);
    const dir2After = degreeMatch[6]?.toUpperCase();

    if (!isNaN(num1) && !isNaN(num2)) {
      // Determine which is lat and which is lon based on direction letters
      const dir1 = dir1Before || dir1After;
      const dir2 = dir2Before || dir2After;

      let lat: number, lon: number;

      if (dir1 === 'N' || dir1 === 'S') {
        lat = dir1 === 'S' ? -num1 : num1;
        lon = dir2 === 'W' ? -num2 : num2;
      } else if (dir1 === 'E' || dir1 === 'W') {
        lon = dir1 === 'W' ? -num1 : num1;
        lat = dir2 === 'S' ? -num2 : num2;
      } else {
        // No direction specified, assume first is lat, second is lon
        lat = num1;
        lon = num2;
      }

      // Validate ranges
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

  // Remove common prefixes
  const cleaned = input
    .toLowerCase()
    .replace(/\b(lat|latitude|nord|north|n)[\s:=]*/gi, '')
    .replace(/\b(lon|lng|longitude|øst|ost|east|e)[\s:=]*/gi, '')
    .trim();

  // Split by common separators
  const parts = cleaned.split(/[,;\s]+/).filter((p) => p.length > 0);

  if (parts.length !== 2) {
    return null;
  }

  const num1 = parseFloat(parts[0]);
  const num2 = parseFloat(parts[1]);

  if (isNaN(num1) || isNaN(num2)) {
    return null;
  }

  // Determine if these are lat/lon (WGS84) based on reasonable ranges
  // Latitude: typically -90 to 90
  // Longitude: typically -180 to 180
  // Norway is roughly: lat 58-71, lon 4-31

  const isLatLon =
    Math.abs(num1) <= 90 &&
    Math.abs(num2) <= 180 &&
    (Math.abs(num1) < 80 || Math.abs(num2) < 80); // At least one should be reasonable

  if (isLatLon) {
    // Assume first is lat, second is lon
    const lat = num1;
    const lon = num2;

    return {
      lat,
      lon,
      projection: 'EPSG:4326',
      formattedString: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
      inputFormat: 'decimal',
    };
  }

  return null;
};

/**
 * Parse DMS (Degrees, Minutes, Seconds) format
 * Examples: "59°54'45.8\"N 10°44'45.9\"E", "59° 54' 45.8\" N, 10° 44' 45.9\" E"
 * Also supports decimal minutes (DM): "60° 50.466' N, 04° 52.535' E"
 * Also supports: "N 60° 5' 38'', E 10° 50' 10''" (direction before)
 * Also supports: "60°10'10,10°10'10" (no direction, no quotes on seconds)
 */
const parseDMS = (input: string): ParsedCoordinate | null => {
  const applyDirection = (value: number, dir: string): number => {
    return dir === 'S' || dir === 'W' ? -value : value;
  };

  const assignLatLon = (
    val1: number,
    dir1: string,
    val2: number,
    dir2: string,
  ): { lat: number; lon: number } => {
    if (dir1 === 'N' || dir1 === 'S') {
      return {
        lat: applyDirection(val1, dir1),
        lon: applyDirection(val2, dir2),
      };
    }
    return {
      lon: applyDirection(val1, dir1),
      lat: applyDirection(val2, dir2),
    };
  };

  const validateAndReturn = (
    lat: number,
    lon: number,
  ): ParsedCoordinate | null => {
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      return createDMSResult(lat, lon);
    }
    return null;
  };

  // Pattern 1: Direction BEFORE coordinates (e.g., "N 60° 5' 38'', E 10° 50' 10''")
  const dirBeforePattern =
    /([NSEW])\s*(\d+)\s*°\s*(\d+)\s*['\u2032]\s*(\d+(?:\.\d+)?)\s*["\u2033']{0,2}\s*[,;\s]*([NSEW])\s*(\d+)\s*°\s*(\d+)\s*['\u2032]\s*(\d+(?:\.\d+)?)\s*["\u2033']{0,2}/i;
  const dirBeforeMatch = input.match(dirBeforePattern);

  if (dirBeforeMatch) {
    const [, d1, deg1, min1, sec1, d2, deg2, min2, sec2] = dirBeforeMatch;
    const dir1 = d1.toUpperCase();
    const dir2 = d2.toUpperCase();
    const m1 = parseInt(min1, 10);
    const s1 = parseFloat(sec1);
    const m2 = parseInt(min2, 10);
    const s2 = parseFloat(sec2);

    if (m1 < 60 && s1 < 60 && m2 < 60 && s2 < 60) {
      const val1 = parseInt(deg1, 10) + m1 / 60 + s1 / 3600;
      const val2 = parseInt(deg2, 10) + m2 / 60 + s2 / 3600;
      const { lat, lon } = assignLatLon(val1, dir1, val2, dir2);
      return validateAndReturn(lat, lon);
    }
  }

  // Pattern 2: DMS without quotes on seconds and no direction (e.g., "60°10'10,10°10'10")
  const dmsNoQuotesPattern =
    /(\d+)\s*°\s*(\d+)\s*['\u2032]\s*(\d+(?:\.\d+)?)\s*[,;\s]+(\d+)\s*°\s*(\d+)\s*['\u2032]\s*(\d+(?:\.\d+)?)/;
  const dmsNoQuotesMatch = input.match(dmsNoQuotesPattern);

  if (dmsNoQuotesMatch) {
    const [, deg1, min1, sec1, deg2, min2, sec2] = dmsNoQuotesMatch;
    const m1 = parseInt(min1, 10);
    const s1 = parseFloat(sec1);
    const m2 = parseInt(min2, 10);
    const s2 = parseFloat(sec2);

    if (m1 < 60 && s1 < 60 && m2 < 60 && s2 < 60) {
      const lat = parseInt(deg1, 10) + m1 / 60 + s1 / 3600;
      const lon = parseInt(deg2, 10) + m2 / 60 + s2 / 3600;
      return validateAndReturn(lat, lon);
    }
  }

  // Pattern 3: Degrees and decimal minutes only, no direction (e.g., "60°10.5',10°10.5'")
  const dmNoDirectionPattern =
    /(\d+)\s*°\s*(\d+(?:\.\d+)?)\s*['\u2032]\s*[,;\s]+(\d+)\s*°\s*(\d+(?:\.\d+)?)\s*['\u2032]/;
  const dmNoDirectionMatch = input.match(dmNoDirectionPattern);

  if (dmNoDirectionMatch) {
    const [, deg1, min1, deg2, min2] = dmNoDirectionMatch;
    const m1 = parseFloat(min1);
    const m2 = parseFloat(min2);

    if (m1 < 60 && m2 < 60) {
      const lat = parseInt(deg1, 10) + m1 / 60;
      const lon = parseInt(deg2, 10) + m2 / 60;
      return validateAndReturn(lat, lon);
    }
  }

  // Pattern 4: Decimal minutes with only first direction (e.g., "58° 09.83' N, 06° 48.76'")
  const dmPartialDirectionPattern =
    /(\d+)\s*°\s*(\d+(?:\.\d+)?)\s*['\u2032]\s*([NSEW])\s*[,;\s]+(\d+)\s*°\s*(\d+(?:\.\d+)?)\s*['\u2032]?\s*$/i;
  const dmPartialDirectionMatch = input.match(dmPartialDirectionPattern);

  if (dmPartialDirectionMatch) {
    const [, deg1, min1, d1, deg2, min2] = dmPartialDirectionMatch;
    const dir1 = d1.toUpperCase();
    const m1 = parseFloat(min1);
    const m2 = parseFloat(min2);

    if (m1 < 60 && m2 < 60) {
      const val1 = parseInt(deg1, 10) + m1 / 60;
      const val2 = parseInt(deg2, 10) + m2 / 60;

      let lat: number, lon: number;
      if (dir1 === 'N' || dir1 === 'S') {
        lat = applyDirection(val1, dir1);
        lon = val2; // Assume positive (E)
      } else {
        lon = applyDirection(val1, dir1);
        lat = val2; // Assume positive (N)
      }
      return validateAndReturn(lat, lon);
    }
  }

  // Pattern 5: Standard DMS format with direction after (with quotes)
  // Support multiple quote styles: ' " (ASCII), ′ ″ (Unicode prime), '' (two single quotes)
  const dmsPattern =
    /(\d+)[°\s]+(\d+)['\u2032'\s]+(\d+(?:\.\d+)?)["\u2033"']{0,2}\s*([NSEW])/gi;
  let matches = Array.from(input.matchAll(dmsPattern));
  const hasDMS = matches.length === 2;

  // If DMS didn't match, try decimal minutes format (without seconds)
  if (!hasDMS) {
    const dmPattern = /(\d+)[°\s]+(\d+(?:\.\d+)?)['\u2032'\s]*([NSEW])/gi;
    matches = Array.from(input.matchAll(dmPattern));

    if (matches.length !== 2) {
      return null;
    }
  }

  let lat: number | null = null;
  let lon: number | null = null;

  for (const match of matches) {
    const degrees = parseInt(match[1], 10);
    const minutesValue = parseFloat(match[2]);

    let decimal: number;
    let direction: string;

    if (hasDMS) {
      const minutes = Math.floor(minutesValue);
      const seconds = parseFloat(match[3]);
      direction = match[4].toUpperCase();

      if (isNaN(minutes) || isNaN(seconds) || minutes >= 60 || seconds >= 60) {
        return null;
      }
      decimal = degrees + minutes / 60 + seconds / 3600;
    } else {
      direction = match[3].toUpperCase();

      if (isNaN(minutesValue) || minutesValue >= 60) {
        return null;
      }
      decimal = degrees + minutesValue / 60;
    }

    if (isNaN(degrees)) {
      return null;
    }

    if (direction === 'N' || direction === 'S') {
      lat = applyDirection(decimal, direction);
    } else if (direction === 'E' || direction === 'W') {
      lon = applyDirection(decimal, direction);
    }
  }

  if (lat === null || lon === null) {
    return null;
  }

  return createDMSResult(lat, lon);
};

/**
 * Parse projected coordinates (UTM or Web Mercator)
 * Examples: "598515, 6643994", "east: 598515, north: 6643994", "33W 598515 6643994"
 * Examples (Web Mercator): "799157, 8273408"
 * Examples with direction: "6653873.01 N, 227047.11 E"
 * Assumes UTM zone 33N (EPSG:25833) for Norway unless specified
 *
 * @param input - The coordinate string to parse
 * @param fallbackProjection - Optional projection to use when no zone is specified and coordinates are ambiguous
 */
const parseUTM = (
  input: string,
  fallbackProjection?: ProjectionIdentifier,
): ParsedCoordinate | null => {
  // Check if input has direction letters (N/E) to determine coordinate order
  // Pattern: number [N/E], number [N/E]
  const directionPattern =
    /(\d+(?:\.\d+)?)\s*([NE])\s*[,;]\s*(\d+(?:\.\d+)?)\s*([NE])/i;
  const dirMatch = input.match(directionPattern);

  let shouldSwapCoordinates = false;
  if (dirMatch) {
    const firstDir = dirMatch[2].toUpperCase();
    // If first coordinate has 'N', it's Northing, so we need to swap (East comes first internally)
    if (firstDir === 'N') {
      shouldSwapCoordinates = true;
    }
  }

  // Remove common prefixes and parentheses
  const cleaned = input
    .toLowerCase()
    .replace(/\b(east|easting|øst|ost|e)[\s:=]*/gi, '')
    .replace(/\b(north|northing|nord|n)[\s:=]*/gi, '')
    .replace(/\b(zone|sone|utm)[\s:=]*/gi, '')
    .replace(/[()]/g, '') // Remove parentheses
    .trim();

  // Split by common separators
  const parts = cleaned.split(/[,;\s]+/).filter((p) => p.length > 0);

  if (parts.length < 2) {
    return null;
  }

  // Extract zone if present (e.g., "33", "33N", "33W", "W33", "32633")
  let zone: number | null = null;
  let numStartIdx = 0;
  let explicitZone = false;

  // Check if first part is a zone indicator (formats: "33N", "33W", "W33", etc.)
  const firstPart = parts[0];
  const zoneMatch = firstPart.match(/^([A-Z]?)(\d{1,2})([A-Z]?)$/i);
  if (zoneMatch && parts.length >= 3) {
    zone = parseInt(zoneMatch[2], 10);
    numStartIdx = 1;
    explicitZone = true;
  }

  // Also check for 5-digit EPSG codes like 32633 (zone 32, EPSG:25832)
  if (!explicitZone && parts.length >= 3) {
    const epsgMatch = firstPart.match(/^(\d{5})$/);
    if (epsgMatch) {
      const epsgCode = parseInt(epsgMatch[1], 10);
      if (epsgCode >= 32632 && epsgCode <= 32636) {
        zone = epsgCode - 32600; // Extract zone from EPSG code
        numStartIdx = 1;
        explicitZone = true;
      } else if (epsgCode >= 25832 && epsgCode <= 25836) {
        zone = epsgCode - 25800; // Extract zone from EPSG code
        numStartIdx = 1;
        explicitZone = true;
      }
    }
  }

  // Also check last part for zone/EPSG code
  if (!explicitZone && parts.length >= 3) {
    const lastPart = parts[parts.length - 1];
    const lastZoneMatch = lastPart.match(/^(\d{5})$/);
    if (lastZoneMatch) {
      const epsgCode = parseInt(lastZoneMatch[1], 10);
      if (epsgCode >= 32632 && epsgCode <= 32636) {
        zone = epsgCode - 32600;
        explicitZone = true;
      } else if (epsgCode >= 25832 && epsgCode <= 25836) {
        zone = epsgCode - 25800;
        explicitZone = true;
      }
    }
  }

  const coord1 = parseFloat(parts[numStartIdx]);
  const coord2 = parseFloat(parts[numStartIdx + 1]);

  if (isNaN(coord1) || isNaN(coord2)) {
    return null;
  }

  // Swap if needed based on direction letters or coordinate magnitude
  let east: number, north: number;
  if (shouldSwapCoordinates) {
    // First was Northing, second was Easting (based on direction letters)
    north = coord1;
    east = coord2;
  } else if (coord1 > 1000000 && coord2 < 1000000) {
    // Auto-detect: first number is clearly northing (> 1M), second is easting (< 1M)
    north = coord1;
    east = coord2;
  } else {
    // Normal order: first is Easting, second is Northing
    east = coord1;
    north = coord2;
  }

  // Determine projection and validate ranges
  let projection: ProjectionIdentifier;
  let projectionName: string;

  if (explicitZone && zone !== null) {
    // Zone was explicitly specified - must be UTM
    // Validate UTM ranges (rough check for Norway)
    // Easting: typically 0-1000000
    // Northing: typically 6000000-8000000 for Norway
    if (
      east < -100000 ||
      east > 1200000 ||
      north < 5000000 ||
      north > 9000000
    ) {
      return null;
    }

    switch (zone) {
      case 32:
        projection = 'EPSG:25832';
        projectionName = 'UTM 32N';
        break;
      case 33:
        projection = 'EPSG:25833';
        projectionName = 'UTM 33N';
        break;
      case 34:
        projection = 'EPSG:25834';
        projectionName = 'UTM 34N';
        break;
      case 35:
        projection = 'EPSG:25835';
        projectionName = 'UTM 35N';
        break;
      case 36:
        projection = 'EPSG:25836';
        projectionName = 'UTM 36N';
        break;
      default:
        projection = 'EPSG:25833'; // Default
        zone = 33;
        projectionName = 'UTM 33N';
        break;
    }
  } else {
    // No explicit zone - check if fallback projection is provided
    if (fallbackProjection) {
      // First, determine if coordinates look like UTM or Web Mercator based on ranges
      const looksLikeUTM =
        east >= -100000 &&
        east <= 1200000 &&
        north >= 5000000 &&
        north <= 9000000;

      const looksLikeWebMercator =
        east >= 400000 &&
        east <= 4000000 &&
        north >= 7000000 &&
        north <= 12000000;

      if (fallbackProjection.startsWith('EPSG:258')) {
        // UTM projection is preferred
        // Validate UTM ranges
        if (!looksLikeUTM) {
          return null;
        }
        projection = fallbackProjection;
        const zoneFromProjection = parseInt(
          fallbackProjection.replace('EPSG:258', ''),
          10,
        );
        zone = zoneFromProjection;
        projectionName = `UTM ${zone}N`;
      } else if (fallbackProjection === 'EPSG:3857') {
        // Web Mercator - only accept if coordinates don't look like UTM
        // Web Mercator coordinates are typically much larger for Norway
        if (looksLikeUTM && !looksLikeWebMercator) {
          // These look like UTM, not Web Mercator - reject
          return null;
        }
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
        zone = null;
      } else {
        // Fallback is not a projected coordinate system we support
        // Try to validate as UTM 33N
        if (
          east < -100000 ||
          east > 1200000 ||
          north < 5000000 ||
          north > 9000000
        ) {
          return null;
        }
        projection = 'EPSG:25833';
        zone = 33;
        projectionName = 'UTM 33N';
      }
    } else {
      // No fallback - default to UTM 33N
      if (
        east < -100000 ||
        east > 1200000 ||
        north < 5000000 ||
        north > 9000000
      ) {
        return null;
      }
      projection = 'EPSG:25833';
      zone = 33;
      projectionName = 'UTM 33N';
    }
  }

  // Format the coordinate string based on projection type
  let formattedString: string;
  if (projection === 'EPSG:3857') {
    formattedString = `${projectionName}: ${east.toFixed(0)}E ${north.toFixed(0)}N`;
  } else {
    formattedString = `${projectionName}: ${east.toFixed(0)}E ${north.toFixed(0)}N`;
  }

  return {
    lat: north,
    lon: east,
    projection,
    formattedString,
    inputFormat: 'utm',
  };
};
