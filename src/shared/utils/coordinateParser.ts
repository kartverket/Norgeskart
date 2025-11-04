import { ProjectionIdentifier } from '../../map/atoms';

export interface ParsedCoordinate {
  lat: number;
  lon: number;
  projection: ProjectionIdentifier;
  formattedString: string;
  inputFormat: 'decimal' | 'dms' | 'utm';
}

/**
 * Parses coordinate input from search query and detects format
 * Supports:
 * - Decimal degrees: "59.91273, 10.74609" or "lat: 59.91273, lon: 10.74609"
 * - DMS: "59°54'45.8\"N 10°44'45.9\"E"
 * - UTM: "598515, 6643994" or "east: 598515, north: 6643994"
 * - EPSG specified: "425917 7730314@25833" or "59.91273, 10.74609@4326"
 */
export const parseCoordinateInput = (
  input: string,
): ParsedCoordinate | null => {
  if (!input || input.trim().length === 0) {
    return null;
  }

  const trimmedInput = input.trim();

  // Try parsing with EPSG code specified (format: "coords@epsg")
  const epsgResult = parseWithEPSG(trimmedInput);
  if (epsgResult) {
    return epsgResult;
  }

  // Try parsing decimal degrees
  const decimalResult = parseDecimalDegrees(trimmedInput);
  if (decimalResult) {
    return decimalResult;
  }

  // Try parsing DMS
  const dmsResult = parseDMS(trimmedInput);
  if (dmsResult) {
    return dmsResult;
  }

  // Try parsing UTM
  const utmResult = parseUTM(trimmedInput);
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
  // Check if input contains @ symbol
  if (!input.includes('@')) {
    return null;
  }

  const parts = input.split('@');
  if (parts.length !== 2) {
    return null;
  }

  const coordsPart = parts[0].trim();
  const epsgPart = parts[1].trim();

  // Parse EPSG code
  const epsgMatch = epsgPart.match(/^(\d{4,5})$/);
  if (!epsgMatch) {
    return null;
  }

  const epsgCode = parseInt(epsgMatch[1], 10);

  // Map EPSG code to ProjectionIdentifier
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
      // Unsupported EPSG code
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

  if (epsgCode === 4326 || epsgCode === 4258) {
    // Geographic coordinates (lat/lon)
    inputFormat = 'decimal';
    formattedString = `${coord1.toFixed(5)}, ${coord2.toFixed(5)} (${formatName})`;
  } else {
    // Projected coordinates (UTM, Web Mercator, etc.)
    inputFormat = 'utm';
    formattedString = `${formatName}: ${coord1.toFixed(0)}E ${coord2.toFixed(0)}N`;
  }

  return {
    lat: coord2, // Second coordinate is typically northing/latitude
    lon: coord1, // First coordinate is typically easting/longitude
    projection,
    formattedString,
    inputFormat,
  };
};

/**
 * Parse decimal degrees format
 * Examples: "59.91273, 10.74609", "lat: 59.91273, lon: 10.74609", "59.91273; 10.74609"
 */
const parseDecimalDegrees = (input: string): ParsedCoordinate | null => {
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
 */
const parseDMS = (input: string): ParsedCoordinate | null => {
  // First try to match DMS format (with seconds)
  const dmsPattern = /(\d+)[°\s]+(\d+)['\s]+(\d+(?:\.\d+)?)["\s]*([NSEW])/gi;
  let matches = Array.from(input.matchAll(dmsPattern));

  const hasDMS = matches.length === 2;

  // If DMS didn't match, try decimal minutes format (without seconds)
  if (!hasDMS) {
    const dmPattern = /(\d+)[°\s]+(\d+(?:\.\d+)?)['\s]*([NSEW])/gi;
    matches = Array.from(input.matchAll(dmPattern));

    if (matches.length !== 2) {
      return null;
    }
  }

  let lat: number | null = null;
  let lon: number | null = null;

  for (const match of matches) {
    const degrees = parseInt(match[1], 10);
    const minutesOrSeconds = parseFloat(match[2]);
    const secondsOrDirection = match[3];

    let minutes: number;
    let seconds: number;
    let direction: string;

    if (hasDMS) {
      // DMS format: degrees, minutes, seconds, direction
      minutes = Math.floor(minutesOrSeconds);
      seconds = parseFloat(secondsOrDirection);
      direction = match[4].toUpperCase();

      if (
        isNaN(degrees) ||
        isNaN(minutes) ||
        isNaN(seconds) ||
        minutes >= 60 ||
        seconds >= 60
      ) {
        return null;
      }
    } else {
      // DM format: degrees, decimal minutes, direction
      minutes = minutesOrSeconds;
      seconds = 0;
      direction = secondsOrDirection.toUpperCase();

      if (isNaN(degrees) || isNaN(minutes) || minutes >= 60) {
        return null;
      }
    }

    const decimal = degrees + minutes / 60 + seconds / 3600;

    if (direction === 'N' || direction === 'S') {
      lat = direction === 'S' ? -decimal : decimal;
    } else if (direction === 'E' || direction === 'W') {
      lon = direction === 'W' ? -decimal : decimal;
    }
  }

  if (lat === null || lon === null) {
    return null;
  }

  // Format back to DMS for display
  const formatDMS = (value: number, isLat: boolean): string => {
    const abs = Math.abs(value);
    const degrees = Math.floor(abs);
    const minutes = Math.floor((abs - degrees) * 60);
    const seconds = ((abs - degrees - minutes / 60) * 3600).toFixed(1);
    const direction = isLat ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };

  return {
    lat,
    lon,
    projection: 'EPSG:4326',
    formattedString: `${formatDMS(lat, true)} ${formatDMS(lon, false)}`,
    inputFormat: 'dms',
  };
};

/**
 * Parse UTM coordinates
 * Examples: "598515, 6643994", "east: 598515, north: 6643994", "33W 598515 6643994"
 * Assumes UTM zone 33N (EPSG:25833) for Norway unless specified
 */
const parseUTM = (input: string): ParsedCoordinate | null => {
  // Remove common prefixes
  const cleaned = input
    .toLowerCase()
    .replace(/\b(east|easting|øst|ost|e)[\s:=]*/gi, '')
    .replace(/\b(north|northing|nord|n)[\s:=]*/gi, '')
    .replace(/\b(zone|sone|utm)[\s:=]*/gi, '')
    .trim();

  // Split by common separators
  const parts = cleaned.split(/[,;\s]+/).filter((p) => p.length > 0);

  if (parts.length < 2) {
    return null;
  }

  // Extract zone if present (e.g., "33", "33N", "33W", "W33")
  let zone = 33; // Default for Norway
  let numStartIdx = 0;

  // Check if first part is a zone indicator (formats: "33N", "33W", "W33", etc.)
  const firstPart = parts[0];
  const zoneMatch = firstPart.match(/^([A-Z]?)(\d{1,2})([A-Z]?)$/i);
  if (zoneMatch && parts.length >= 3) {
    zone = parseInt(zoneMatch[2], 10);
    numStartIdx = 1;
  }

  const east = parseFloat(parts[numStartIdx]);
  const north = parseFloat(parts[numStartIdx + 1]);

  if (isNaN(east) || isNaN(north)) {
    return null;
  }

  // Validate UTM ranges (rough check for Norway)
  // Easting: typically 0-1000000
  // Northing: typically 6000000-8000000 for Norway
  if (east < -100000 || east > 1200000 || north < 5000000 || north > 9000000) {
    return null;
  }

  // Determine projection based on zone
  let projection: ProjectionIdentifier;
  switch (zone) {
    case 32:
      projection = 'EPSG:25832';
      break;
    case 33:
      projection = 'EPSG:25833';
      break;
    case 34:
      projection = 'EPSG:25834'; // Use 25833 as fallback for zone 34
      break;
    case 35:
      projection = 'EPSG:25835';
      break;
    case 36:
      projection = 'EPSG:25836';
      break;
    default:
      projection = 'EPSG:25833'; // Default
      break;
  }

  return {
    lat: north,
    lon: east,
    projection,
    formattedString: `UTM ${zone}N: ${east.toFixed(0)}E ${north.toFixed(0)}N`,
    inputFormat: 'utm',
  };
};
