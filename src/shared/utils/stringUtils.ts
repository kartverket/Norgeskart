export const capitalizeFirstLetter = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const formatDistance = (distanceInMeters: number) => {
  if (distanceInMeters < 1000) {
    return `${distanceInMeters.toFixed(2)} m`;
  } else {
    return `${(distanceInMeters / 1000).toFixed(2)} km`;
  }
};

export const formatArea = (areaInSquareMeters: number) => {
  if (areaInSquareMeters < 10000) {
    return `${areaInSquareMeters.toFixed(2)} m²`;
  } else {
    return `${(areaInSquareMeters / (10000 * 1000)).toFixed(2)} km²`;
  }
};
