export const DEKNINGSSTATUS_ENTRIES = [
  { key: 'fullstendig', color: '#a6d388' },
  { key: 'ufullstendig', color: '#e8d38a' },
  { key: 'ikkeKartlagt', color: '#f09c5a' },
  { key: 'ikkeRelevant', color: '#b4b4b4' },
] as const;

export type DekningsstatusKey =
  (typeof DEKNINGSSTATUS_ENTRIES)[number]['key'];

export const DEKNINGSSTATUS_COLORS: Record<string, string> =
  Object.fromEntries(
    DEKNINGSSTATUS_ENTRIES.map(({ key, color }) => [key, color]),
  );
