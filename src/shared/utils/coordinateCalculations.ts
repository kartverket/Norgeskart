export const calculateAzimuth = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const lat1Rad = degToRadians(lat1);
  const lon1Rad = degToRadians(lon1);
  const lat2Rad = degToRadians(lat2);
  const lon2Rad = degToRadians(lon2);

  const deltaLon = lon2Rad - lon1Rad;

  const arg1 = Math.sin(deltaLon) * Math.cos(lat2Rad);
  const arg2 =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLon);

  const azRadians = Math.atan2(arg1, arg2);

  // Convert to degrees
  const azimuth = radiansToDegrees(azRadians);

  // Normalize to [0, 360) degrees
  if (azimuth < 0) {
    return azimuth + 360;
  }

  return azimuth;
};

const degToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

const radiansToDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

/**
 * Calculates the meridian convergence (γ) for a Transverse Mercator / UTM projection.
 * γ is the angle from true north to grid north, measured clockwise.
 * Positive when the point is east of the central meridian; negative when west.
 */
export const calculateGridConvergence = (
  latDeg: number,
  lonDeg: number,
  centralMeridianDeg: number,
): number => {
  const latRad = degToRadians(latDeg);
  const deltaLonRad = degToRadians(lonDeg - centralMeridianDeg);
  return radiansToDegrees(Math.atan(Math.tan(deltaLonRad) * Math.sin(latRad)));
};

// Oslo prime meridian offset from Greenwich (degrees East)
const OSLO_PRIME_MERIDIAN = 10.722916667;

/**
 * Returns the central meridian (degrees East of Greenwich) for Transverse Mercator
 * / UTM projections used in Norgeskart.
 * Returns null for geographic or Web Mercator projections where grid north = true north.
 */
export const getCentralMeridianDeg = (projectionCode: string): number | null => {
  switch (projectionCode) {
    // EUREF89 UTM
    case 'EPSG:25832': return 9;
    case 'EPSG:25833': return 15;
    case 'EPSG:25834': return 21;
    case 'EPSG:25835': return 27;
    case 'EPSG:25836': return 33;
    // ED50 UTM
    case 'EPSG:23031': return 3;
    case 'EPSG:23032': return 9;
    case 'EPSG:23033': return 15;
    case 'EPSG:23034': return 21;
    case 'EPSG:23035': return 27;
    case 'EPSG:23036': return 33;
    // NGO 1948 Gauss-Kruger (lon_0 is relative to Oslo prime meridian)
    case 'EPSG:27391': return -4.666666667 + OSLO_PRIME_MERIDIAN;
    case 'EPSG:27392': return -2.333333333 + OSLO_PRIME_MERIDIAN;
    case 'EPSG:27393': return OSLO_PRIME_MERIDIAN;
    case 'EPSG:27394': return 2.5 + OSLO_PRIME_MERIDIAN;
    case 'EPSG:27395': return 6.166666667 + OSLO_PRIME_MERIDIAN;
    case 'EPSG:27396': return 10.166666667 + OSLO_PRIME_MERIDIAN;
    case 'EPSG:27397': return 14.166666667 + OSLO_PRIME_MERIDIAN;
    case 'EPSG:27398': return 18.333333333 + OSLO_PRIME_MERIDIAN;
    // Geographic (EPSG:4326, EPSG:4258, EPSG:4230) and Web Mercator (EPSG:3857)
    default: return null;
  }
};
