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

export const computeLevenshteinDistance = (
  input1: string,
  input2: string,
): number => {
  const s1 = input1.toLowerCase();
  const s2 = input2.toLowerCase();
  if (s1 === s2) return 0;
  if (!s1.length || !s2.length) return s1.length + s2.length;

  // Create matrix for dynamic programming
  const matrix = [];
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i]; // Initialize the first column
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j; // Initialize the first row
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      const cost = s1[j - 1] === s2[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deletion
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + cost, // Substitution
      );
    }
  }

  // The bottom-right cell contains the final distance
  return matrix[s2.length][s1.length];
};
