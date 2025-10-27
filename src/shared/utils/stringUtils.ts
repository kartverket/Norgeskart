import { DistanceUnit } from '../../settings/draw/atoms';

export const capitalizeFirstLetter = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const formatDistance = (
  distanceInMeters: number,
  unit?: DistanceUnit,
) => {
  switch (unit) {
    case 'NM': {
      const distanceInNauticalMiles = distanceInMeters / 1852;
      return `${formatNumberWithThousandSeparators(distanceInNauticalMiles)} NM`;
    }
    case undefined: // Default to meters if no unit is specified
    case 'm': {
      if (distanceInMeters < 1000) {
        return `${formatNumberWithThousandSeparators(distanceInMeters)} m`;
      } else {
        return `${formatNumberWithThousandSeparators(distanceInMeters / 1000)} km`;
      }
    }
  }
};

const formatNumberWithThousandSeparators = (num: number) => {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const formatArea = (areaInSquareMeters: number, unit?: DistanceUnit) => {
  switch (unit) {
    case 'NM': {
      const areaInSquareNauticalMiles = areaInSquareMeters / (1852 * 1852);
      return `${formatNumberWithThousandSeparators(areaInSquareNauticalMiles)} NM²`;
    }

    case undefined: // Default to square meters if no unit is specified
    case 'm': {
      if (areaInSquareMeters < 10000) {
        return `${formatNumberWithThousandSeparators(areaInSquareMeters)} m²`;
      } else {
        return `${formatNumberWithThousandSeparators(areaInSquareMeters / 1_000_000)} km²`;
      }
    }
  }
};

export const createHash = (text: string) => {
  let hash = 0;

  if (text.length == 0) return hash;

  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
};
