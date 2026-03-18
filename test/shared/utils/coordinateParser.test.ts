import { describe, expect, it, vi } from 'vitest';
import { parseCoordinateInput } from '../../../src/shared/utils/coordinateParser';

// i18n returns the key as-is when not initialized; the parser uses this as a
// fallback display name (which is fine) but crashes if t() returns undefined.
vi.mock('i18next', () => ({
  default: { t: (key: string) => key },
}));

describe('parseCoordinateInput', () => {
  // ─── Decimal degrees ──────────────────────────────────────────────────────

  describe('decimal degrees', () => {
    it('parses standard lat, lon with comma', () => {
      const result = parseCoordinateInput('59.91273, 10.74609');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(59.91273, 4);
      expect(result?.lon).toBeCloseTo(10.74609, 4);
      expect(result?.projection).toBe('EPSG:4326');
      expect(result?.inputFormat).toBe('decimal');
    });

    it('parses lat lon separated by space', () => {
      const result = parseCoordinateInput('60.391263 5.322054');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(60.391263, 4);
      expect(result?.lon).toBeCloseTo(5.322054, 4);
    });

    it('parses lat lon separated by semicolon', () => {
      const result = parseCoordinateInput('59.91273; 10.74609');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(59.91273, 4);
      expect(result?.lon).toBeCloseTo(10.74609, 4);
    });

    it('parses with lat:/lon: prefixes', () => {
      const result = parseCoordinateInput('lat: 59.91273, lon: 10.74609');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(59.91273, 4);
      expect(result?.lon).toBeCloseTo(10.74609, 4);
    });

    it('parses European decimal format (3+ digits after comma)', () => {
      const result = parseCoordinateInput('60,135106, 10,618917');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(60.135106, 4);
      expect(result?.lon).toBeCloseTo(10.618917, 4);
    });

    it('parses European decimal format without space after comma-separator', () => {
      const result = parseCoordinateInput('60,13,10,61');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(60.13, 2);
      expect(result?.lon).toBeCloseTo(10.61, 2);
    });

    it('parses with degree symbol and N/E suffix', () => {
      const result = parseCoordinateInput('59.9494° N, 10.7564° E');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(59.9494, 3);
      expect(result?.lon).toBeCloseTo(10.7564, 3);
      expect(result?.inputFormat).toBe('decimal');
    });

    it('parses with degree symbol, no decimal', () => {
      const result = parseCoordinateInput('60° N, 10° E');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(60, 0);
      expect(result?.lon).toBeCloseTo(10, 0);
    });

    it('parses with degree symbol and direction prefix', () => {
      const result = parseCoordinateInput('N 60°, E 10°');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(60, 0);
      expect(result?.lon).toBeCloseTo(10, 0);
    });
  });

  // ─── DMS (Degrees, Minutes, Seconds) ──────────────────────────────────────

  describe('DMS – direction after', () => {
    it('parses DMS with ASCII quotes and N/E suffix', () => {
      const result = parseCoordinateInput('59°54\'45.8"N 10°44\'45.9"E');
      expect(result).not.toBeNull();
      expect(result?.inputFormat).toBe('dms');
      expect(result?.projection).toBe('EPSG:4326');
      expect(result?.lat).toBeCloseTo(59.9127, 3);
      expect(result?.lon).toBeCloseTo(10.7461, 3);
    });

    it('parses DMS with spaces around degree/minute markers', () => {
      const result = parseCoordinateInput('59° 54\' 45.8" N, 10° 44\' 45.9" E');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(59.9127, 3);
      expect(result?.lon).toBeCloseTo(10.7461, 3);
    });

    it('parses DMS with double-single-quote seconds and N/E suffix', () => {
      const result = parseCoordinateInput('60° 14\' 18.306", 9° 55\' 45.113"');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(60.2384, 3);
      expect(result?.lon).toBeCloseTo(9.9292, 3);
    });

    it('parses DMS with quote on first coord only, quote on second', () => {
      const result = parseCoordinateInput("60° 14' 18.306, 9° 55' 45.113\"");
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(60.2384, 3);
      expect(result?.lon).toBeCloseTo(9.9292, 3);
    });

    it('parses DMS without quotes on seconds and no direction', () => {
      const result = parseCoordinateInput("60°10'10,10°10'10");
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(60.1694, 3);
      expect(result?.lon).toBeCloseTo(10.1694, 3);
    });

    it('parses DMS with Unicode prime characters (′ ″)', () => {
      const result = parseCoordinateInput('59°54′45.8″N 10°44′45.9″E');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(59.9127, 3);
      expect(result?.lon).toBeCloseTo(10.7461, 3);
    });
  });

  describe('DMS – direction before', () => {
    it('parses DMS with direction prefix and double single-quotes', () => {
      const result = parseCoordinateInput("N 60° 5' 38'', E 10° 50' 10''");
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(60.0939, 3);
      expect(result?.lon).toBeCloseTo(10.8361, 3);
    });
  });

  // ─── DM (Degrees, decimal Minutes) ────────────────────────────────────────

  describe('DM – decimal minutes with direction after', () => {
    it('parses DM with N/E suffixes', () => {
      const result = parseCoordinateInput("60° 50.466' N, 04° 52.535' E");
      expect(result).not.toBeNull();
      expect(result?.inputFormat).toBe('dms');
      expect(result?.lat).toBeCloseTo(60.8411, 3);
      expect(result?.lon).toBeCloseTo(4.8756, 3);
    });

    it('parses DM with only first direction specified', () => {
      const result = parseCoordinateInput("58° 09.83' N, 06° 48.76'");
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(58.1638, 3);
      expect(result?.lon).toBeCloseTo(6.8127, 3);
    });

    it('parses DM without any direction', () => {
      const result = parseCoordinateInput("60°10.5',10°10.5'");
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(60.175, 3);
      expect(result?.lon).toBeCloseTo(10.175, 3);
    });
  });

  describe('DM – direction before', () => {
    it('parses DM with direction prefix (N 60° 44.077 E 011° 15.943)', () => {
      const result = parseCoordinateInput('N 60° 44.077 E 011° 15.943');
      expect(result).not.toBeNull();
      expect(result?.inputFormat).toBe('dms');
      expect(result?.lat).toBeCloseTo(60.7346, 3);
      expect(result?.lon).toBeCloseTo(11.2657, 3);
    });

    it('parses DM with direction prefix and comma separator', () => {
      const result = parseCoordinateInput('N 60° 44.077, E 011° 15.943');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(60.7346, 3);
      expect(result?.lon).toBeCloseTo(11.2657, 3);
    });
  });

  // ─── UTM ──────────────────────────────────────────────────────────────────

  describe('UTM – no zone specified', () => {
    it('parses default UTM 33N pair (space-separated)', () => {
      const result = parseCoordinateInput('598515 6643994');
      expect(result).not.toBeNull();
      expect(result?.inputFormat).toBe('utm');
      expect(result?.projection).toBe('EPSG:25833');
    });

    it('parses UTM pair with comma', () => {
      const result = parseCoordinateInput('598515, 6643994');
      expect(result).not.toBeNull();
      expect(result?.inputFormat).toBe('utm');
    });

    it('parses UTM with east:/north: prefixes', () => {
      const result = parseCoordinateInput('east: 598515, north: 6643994');
      expect(result).not.toBeNull();
      expect(result?.inputFormat).toBe('utm');
    });

    it('uses fallback projection EPSG:25832', () => {
      const result = parseCoordinateInput('598515 6643994', 'EPSG:25832');
      expect(result).not.toBeNull();
      expect(result?.projection).toBe('EPSG:25832');
    });

    it('auto-detects northing-first order when first value > 1M', () => {
      const result = parseCoordinateInput('6643994 598515');
      expect(result).not.toBeNull();
      expect(result?.lat).toBe(6643994);
      expect(result?.lon).toBe(598515);
    });
  });

  describe('UTM – explicit zone', () => {
    it('parses with zone prefix (33W format)', () => {
      const result = parseCoordinateInput('33W 598515 6643994');
      expect(result).not.toBeNull();
      expect(result?.projection).toBe('EPSG:25833');
    });

    it('parses with 5-digit EPSG zone prefix (32633)', () => {
      const result = parseCoordinateInput('32633 598515 6643994');
      expect(result).not.toBeNull();
      expect(result?.projection).toBe('EPSG:25833');
    });
  });

  describe('UTM – direction letters', () => {
    it('parses Northing N, Easting E order', () => {
      const result = parseCoordinateInput('6653873 N, 227047 E');
      expect(result).not.toBeNull();
      expect(result?.inputFormat).toBe('utm');
      expect(result?.lat).toBe(6653873);
      expect(result?.lon).toBe(227047);
    });

    it('parses with decimal values and N/E letters', () => {
      const result = parseCoordinateInput('6653873.01 N, 227047.11 E');
      expect(result).not.toBeNull();
      expect(result?.inputFormat).toBe('utm');
    });
  });

  // ─── Explicit EPSG via @ ───────────────────────────────────────────────────

  describe('explicit EPSG via @', () => {
    it('parses UTM 33N with @25833', () => {
      const result = parseCoordinateInput('425917 7730314@25833');
      expect(result).not.toBeNull();
      expect(result?.projection).toBe('EPSG:25833');
      expect(result?.inputFormat).toBe('utm');
    });

    it('parses UTM 32N with @25832', () => {
      const result = parseCoordinateInput('598515 6643994@25832');
      expect(result).not.toBeNull();
      expect(result?.projection).toBe('EPSG:25832');
    });

    it('parses WGS84 with @4326', () => {
      const result = parseCoordinateInput('59.91273 10.74609@4326');
      expect(result).not.toBeNull();
      expect(result?.projection).toBe('EPSG:4326');
      expect(result?.inputFormat).toBe('decimal');
      expect(result?.lat).toBeCloseTo(59.91273, 4);
      expect(result?.lon).toBeCloseTo(10.74609, 4);
    });

    it('parses with full EPSG: prefix', () => {
      const result = parseCoordinateInput('163834.01 6663030.01@EPSG:25833');
      expect(result).not.toBeNull();
      expect(result?.projection).toBe('EPSG:25833');
    });

    it('parses with decimal comma in coordinates', () => {
      const result = parseCoordinateInput('242366.00,6736146.01@EPSG:25833');
      expect(result).not.toBeNull();
      expect(result?.projection).toBe('EPSG:25833');
    });

    it('returns null for unsupported EPSG code', () => {
      const result = parseCoordinateInput('100000 200000@99999');
      expect(result).toBeNull();
    });

    it('returns null for malformed @ expression', () => {
      const result = parseCoordinateInput('598515 6643994@notanumber');
      expect(result).toBeNull();
    });
  });

  // ─── Norwegian direction words ─────────────────────────────────────────────

  describe('Norwegian direction words', () => {
    it('normalizes Nord/Øst to N/E (UTM)', () => {
      const result = parseCoordinateInput('60 Nord, 10 Øst');
      expect(result).not.toBeNull();
    });

    it('normalizes Nord/Øst with decimal degrees', () => {
      const result = parseCoordinateInput('59.91273 Nord, 10.74609 Øst');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(59.91273, 4);
      expect(result?.lon).toBeCloseTo(10.74609, 4);
    });

    it('normalizes full words: North/South/East/West', () => {
      const result = parseCoordinateInput('59.91273 North, 10.74609 East');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(59.91273, 4);
    });
  });

  // ─── Invalid input ─────────────────────────────────────────────────────────

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

    it('returns null for a single number', () => {
      expect(parseCoordinateInput('59.91273')).toBeNull();
    });

    it('returns null for out-of-range lat/lon', () => {
      expect(parseCoordinateInput('200 400')).toBeNull();
    });
  });
});
