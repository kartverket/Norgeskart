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

  // Calculate the azimuth in radians

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
