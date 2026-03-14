import { describe, expect, it, vi } from 'vitest';
import { parseCoordinateInput } from './coordinateParser';

// i18n returns the key as-is when not initialized; the parser uses this as a
// fallback display name (which is fine) but crashes if t() returns undefined.
vi.mock('i18next', () => ({
  default: { t: (key: string) => key },
}));

describe('parseCoordinateInput', () => {
  describe('decimal degrees', () => {
    it('parses standard lat/lon', () => {
      const result = parseCoordinateInput('59.91273, 10.74609');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(59.91273, 4);
      expect(result?.lon).toBeCloseTo(10.74609, 4);
      expect(result?.projection).toBe('EPSG:4326');
      expect(result?.inputFormat).toBe('decimal');
    });

    it('parses coordinates with dot as separator', () => {
      const result = parseCoordinateInput('60.391263 5.322054');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(60.391263, 4);
      expect(result?.lon).toBeCloseTo(5.322054, 4);
    });

    it('parses European decimal format with comma separators', () => {
      const result = parseCoordinateInput('60,135106, 10,618917');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(60.135106, 4);
      expect(result?.lon).toBeCloseTo(10.618917, 4);
    });
  });

  describe('DMS format', () => {
    it('parses DMS with N/E suffixes', () => {
      const result = parseCoordinateInput('59°54\'45.8"N 10°44\'45.9"E');
      expect(result).not.toBeNull();
      expect(result?.inputFormat).toBe('dms');
      expect(result?.projection).toBe('EPSG:4326');
      expect(result?.lat).toBeCloseTo(59.9127, 3);
      expect(result?.lon).toBeCloseTo(10.7461, 3);
    });
  });

  describe('UTM format', () => {
    it('parses UTM 32N coordinates', () => {
      const result = parseCoordinateInput('598515 6643994', 'EPSG:25832');
      expect(result).not.toBeNull();
      expect(result?.inputFormat).toBe('utm');
    });

    it('parses large UTM coordinate pairs', () => {
      const result = parseCoordinateInput('500000 7000000');
      expect(result).not.toBeNull();
      expect(result?.inputFormat).toBe('utm');
    });
  });

  describe('explicit EPSG', () => {
    it('parses coordinates with @EPSG suffix', () => {
      const result = parseCoordinateInput('425917 7730314@25833');
      expect(result).not.toBeNull();
      expect(result?.projection).toBe('EPSG:25833');
    });

    it('parses with full EPSG: prefix', () => {
      const result = parseCoordinateInput('163834.01 6663030.01@EPSG:25833');
      expect(result).not.toBeNull();
      expect(result?.projection).toBe('EPSG:25833');
    });

    it('returns null for unsupported EPSG code', () => {
      const result = parseCoordinateInput('100000 200000@99999');
      expect(result).toBeNull();
    });
  });

  describe('Norwegian direction words', () => {
    it('normalizes Nord/Øst to N/E', () => {
      const result = parseCoordinateInput('60 Nord, 10 Øst');
      expect(result).not.toBeNull();
    });
  });

  describe('invalid input', () => {
    it('returns null for empty string', () => {
      expect(parseCoordinateInput('')).toBeNull();
    });

    it('returns null for whitespace only', () => {
      expect(parseCoordinateInput('   ')).toBeNull();
    });

    it('returns null for plain text', () => {
      expect(parseCoordinateInput('Oslo')).toBeNull();
    });
  });
});
