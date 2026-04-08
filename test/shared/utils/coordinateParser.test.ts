import { describe, expect, it, vi } from 'vitest';
import type { ParsedCoordinate } from '../../../src/shared/utils/coordinateParser';
import {
  isLikelyLonLatSwap,
  parseCoordinateInput,
} from '../../../src/shared/utils/coordinateParser';

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

    it('parses European decimal format with space after comma-separator', () => {
      const result = parseCoordinateInput('60,13, 10,61');
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

    it('parses DM with N/Ø (Norwegian East) suffixes without apostrophe', () => {
      const result = parseCoordinateInput('66°45.005 N, 13°08.050 Ø');
      expect(result).not.toBeNull();
      expect(result?.inputFormat).toBe('dms');
      expect(result?.lat).toBeCloseTo(66.7501, 3);
      expect(result?.lon).toBeCloseTo(13.1342, 3);
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

  // ─── Arctic / high-latitude coordinates ──────────────────────────────────

  describe('arctic and high-latitude coordinates', () => {
    it('parses decimal degrees where both lat and lon are >= 80', () => {
      // Regression test: previously failed when both values were >= 80 due to
      // the old isLatLon heuristic. "80, 80" is a valid coordinate (near Svalbard).
      const result = parseCoordinateInput('80, 80');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(80, 1);
      expect(result?.lon).toBeCloseTo(80, 1);
      expect(result?.projection).toBe('EPSG:4326');
      expect(result?.inputFormat).toBe('decimal');
    });

    it('parses decimal degrees at lat=85 (near North Pole area)', () => {
      const result = parseCoordinateInput('85.0, 85.0');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(85.0, 1);
      expect(result?.lon).toBeCloseTo(85.0, 1);
    });

    it('parses decimal degrees where lat >= 80 but lon < 80', () => {
      // Sanity check: this already works — lon < 80 satisfies the OR condition
      const result = parseCoordinateInput('80.5, 20.0');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(80.5, 1);
      expect(result?.lon).toBeCloseTo(20.0, 1);
    });

    it('parses decimal degrees at Svalbard (high lat, moderate lon)', () => {
      const result = parseCoordinateInput('78.9, 17.2');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(78.9, 1);
      expect(result?.lon).toBeCloseTo(17.2, 1);
    });
  });

  // ─── DM – partial direction (S/W first) ───────────────────────────────────

  describe('DM – partial direction with S or W as first direction', () => {
    it('parses DM with S as the only direction (first coord is southern)', () => {
      // Pattern 5: "deg° min' S, deg° min'" — lat should be negative
      const result = parseCoordinateInput("45° 30.0' S, 10° 15.0'");
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(-45.5, 3);
      expect(result?.lon).toBeCloseTo(10.25, 3);
    });

    it('parses DM with W as the only direction (first coord is western lon)', () => {
      // Pattern 5: "deg° min' W, deg° min'" — lon should be negative, lat is second
      const result = parseCoordinateInput("10° 15.0' W, 45° 30.0'");
      expect(result).not.toBeNull();
      expect(result?.lon).toBeCloseTo(-10.25, 3);
      expect(result?.lat).toBeCloseTo(45.5, 3);
    });
  });

  // ─── Decimal degree hard bounds ───────────────────────────────────────────

  describe('decimal degrees – boundary values', () => {
    it('parses exactly at North Pole latitude (90, 0)', () => {
      const result = parseCoordinateInput('90, 0');
      expect(result).not.toBeNull();
      expect(result?.lat).toBe(90);
      expect(result?.lon).toBe(0);
    });

    it('parses exactly at the Date Line (0, 180)', () => {
      const result = parseCoordinateInput('0, 180');
      expect(result).not.toBeNull();
      expect(result?.lat).toBe(0);
      expect(result?.lon).toBe(180);
    });

    it('parses exactly at South Pole / antimeridian (-90, -180)', () => {
      const result = parseCoordinateInput('-90, -180');
      expect(result).not.toBeNull();
      expect(result?.lat).toBe(-90);
      expect(result?.lon).toBe(-180);
    });

    it('returns null for lat slightly over 90', () => {
      expect(parseCoordinateInput('90.001, 0')).toBeNull();
    });

    it('returns null for lon slightly over 180', () => {
      expect(parseCoordinateInput('0, 180.001')).toBeNull();
    });
  });

  // ─── normalizeDecimalSeparators edge cases ────────────────────────────────

  describe('normalizeDecimalSeparators – comma disambiguation', () => {
    it('does NOT convert commas between two large numbers (UTM pair)', () => {
      // Both sides >= 1000 → treated as coordinate separator, not decimal
      const result = parseCoordinateInput('500000,6000000');
      expect(result).not.toBeNull();
      expect(result?.inputFormat).toBe('utm');
      expect(result?.lon).toBe(500000);
      expect(result?.lat).toBe(6000000);
    });

    it('does NOT convert comma in an ambiguous two-integer pair (60,10)', () => {
      // Single short pattern with no following separator → not converted
      // Parsed as two separate coords: lat=60, lon=10
      const result = parseCoordinateInput('60,10');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(60, 1);
      expect(result?.lon).toBeCloseTo(10, 1);
    });

    it('converts commas when both sides have 1–2 digits and a separator follows', () => {
      // "1,5 10,5" → two short patterns → hasMultipleShortPatterns → convert
      const result = parseCoordinateInput('1,5 10,5');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(1.5, 2);
      expect(result?.lon).toBeCloseTo(10.5, 2);
    });

    it('converts European decimal commas with trailing zeros (242366,00 6736146,01)', () => {
      // Two short patterns → hasMultipleShortPatterns → convert both
      const result = parseCoordinateInput('242366,00 6736146,01@EPSG:25833');
      expect(result).not.toBeNull();
      expect(result?.lon).toBeCloseTo(242366, 0);
      expect(result?.lat).toBeCloseTo(6736146, 0);
    });

    it('does not convert if number before comma already has a dot', () => {
      // "60.5,10" → dot present → comma is a separator
      const result = parseCoordinateInput('60.5,10.5');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(60.5, 2);
      expect(result?.lon).toBeCloseTo(10.5, 2);
    });
  });

  // ─── DMS invalid boundary values ──────────────────────────────────────────

  describe('DMS – invalid minutes and seconds', () => {
    it('returns null when minutes = 60 (direction after)', () => {
      expect(parseCoordinateInput('59°60\'00"N 10°44\'45"E')).toBeNull();
    });

    it('returns null when seconds = 60 (direction after)', () => {
      expect(parseCoordinateInput('59°54\'60"N 10°44\'45"E')).toBeNull();
    });

    it('returns null when DM minutes = 60 (direction after)', () => {
      expect(parseCoordinateInput("60° 60.0' N, 04° 52.535' E")).toBeNull();
    });

    it('returns null when DMS minutes = 60 (direction before)', () => {
      expect(parseCoordinateInput("N 59° 60' 00'', E 10° 44' 45''")).toBeNull();
    });

    it('returns null when DM minutes = 60 (direction before)', () => {
      expect(parseCoordinateInput('N 60° 60.0 E 10° 00.0')).toBeNull();
    });

    it('returns null when DMS minutes = 60 (no direction, Pattern 3)', () => {
      expect(parseCoordinateInput("59°60'00, 10°44'45")).toBeNull();
    });

    it('parses correctly when seconds approach but do not reach 60', () => {
      const result = parseCoordinateInput('59°54\'59.9"N 10°44\'45.9"E');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(59.916, 2);
    });
  });

  // ─── DMS direction before – S and W variants ──────────────────────────────

  describe('DMS – direction before with S/W', () => {
    it('parses DMS with S and W direction prefix', () => {
      const result = parseCoordinateInput("S 45° 30' 0'', W 10° 15' 0''");
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(-45.5, 3);
      expect(result?.lon).toBeCloseTo(-10.25, 3);
    });

    it('parses DM with S and W direction prefix', () => {
      const result = parseCoordinateInput('S 45° 30.0 W 010° 15.0');
      expect(result).not.toBeNull();
      expect(result?.lat).toBeCloseTo(-45.5, 3);
      expect(result?.lon).toBeCloseTo(-10.25, 3);
    });
  });

  // ─── parseWithEPSG – extra variants ───────────────────────────────────────

  describe('explicit EPSG via @ – extra variants', () => {
    it('normalizes EPSG:4258 (ETRS89) to EPSG:4326', () => {
      const result = parseCoordinateInput('59.91273 10.74609@4258');
      expect(result).not.toBeNull();
      expect(result?.projection).toBe('EPSG:4326');
      expect(result?.lat).toBeCloseTo(59.91273, 4);
    });

    it('parses Web Mercator coords with @3857', () => {
      const result = parseCoordinateInput('1197516 8399737@3857');
      expect(result).not.toBeNull();
      expect(result?.projection).toBe('EPSG:3857');
      expect(result?.inputFormat).toBe('utm');
    });

    it('returns null when three coordinate parts are given', () => {
      expect(parseCoordinateInput('1 2 3@4326')).toBeNull();
    });

    it('returns null when coords part is empty', () => {
      expect(parseCoordinateInput('@4326')).toBeNull();
    });

    it('strips x/y label prefixes before parsing', () => {
      const result = parseCoordinateInput('x: 425917 y: 7730314@25833');
      expect(result).not.toBeNull();
      expect(result?.projection).toBe('EPSG:25833');
      expect(result?.lon).toBeCloseTo(425917, 0);
      expect(result?.lat).toBeCloseTo(7730314, 0);
    });

    it('parses UTM 34N with @25834', () => {
      const result = parseCoordinateInput('425917 7730314@25834');
      expect(result).not.toBeNull();
      expect(result?.projection).toBe('EPSG:25834');
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

// ─── isLikelyLonLatSwap ───────────────────────────────────────────────────────

describe('isLikelyLonLatSwap', () => {
  const make = (
    lat: number,
    lon: number,
    projection = 'EPSG:4326',
  ): ParsedCoordinate => ({
    lat,
    lon,
    projection: projection as ParsedCoordinate['projection'],
    formattedString: `${lat}, ${lon}`,
    inputFormat: 'decimal',
  });

  it('returns true when lat in (0,45) and lon in (50,90) – Central Asia region', () => {
    expect(isLikelyLonLatSwap(make(30, 60))).toBe(true);
  });

  it('returns true at near-boundary values (lat=44.9, lon=89.9)', () => {
    expect(isLikelyLonLatSwap(make(44.9, 89.9))).toBe(true);
  });

  it('returns false when lat is exactly 45 (boundary not included)', () => {
    expect(isLikelyLonLatSwap(make(45, 60))).toBe(false);
  });

  it('returns false when lat is exactly 0 (boundary not included)', () => {
    expect(isLikelyLonLatSwap(make(0, 60))).toBe(false);
  });

  it('returns false when lon is exactly 50 (boundary not included)', () => {
    expect(isLikelyLonLatSwap(make(30, 50))).toBe(false);
  });

  it('returns false when lon is exactly 90 (boundary not included)', () => {
    expect(isLikelyLonLatSwap(make(30, 90))).toBe(false);
  });

  it('returns false for negative lat', () => {
    expect(isLikelyLonLatSwap(make(-10, 60))).toBe(false);
  });

  it('returns false for lon outside the swap range', () => {
    expect(isLikelyLonLatSwap(make(30, 10))).toBe(false);
  });

  it('returns false for non-EPSG:4326 projection', () => {
    expect(isLikelyLonLatSwap(make(30, 60, 'EPSG:25833'))).toBe(false);
  });

  it('returns false for typical Norwegian coordinates (lat ~60, lon ~10)', () => {
    expect(isLikelyLonLatSwap(make(60, 10))).toBe(false);
  });
});
