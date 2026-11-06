import { describe, expect, it } from 'vitest';
import {
  HOVER_GROUPS,
  hoverBands,
  isHoverPaused,
  labelPoint,
  pickFeature,
} from '../../../src/map/layers/config/backgroundLayers/hover';

const group = (id: string) => HOVER_GROUPS.find((g) => g.id === id)!;
const source = (scale: string) => `${scale}_restriksjonsomrader_flate`;
const hit = (id: string, objtype = '') => ({
  layer: { id: `hover-hit-${id}-any` },
  properties: { objtype },
});
const square = (x: number, y: number, size: number) => [
  [
    [x, y],
    [x + size, y],
    [x + size, y + size],
    [x, y + size],
    [x, y],
  ],
];

describe('hoverBands', () => {
  it('gives each zoom one archive when the group has scale bands', () => {
    expect(
      hoverBands(group('protected'), {
        [source('n5000')]: { minzoom: 0 },
        [source('n250')]: { minzoom: 8 },
        [source('n50')]: { minzoom: 9 },
        unrelated: { minzoom: 3 },
      }),
    ).toEqual([
      { source: source('n5000'), minzoom: 0, maxzoom: 8 },
      { source: source('n250'), minzoom: 8, maxzoom: 9 },
      { source: source('n50'), minzoom: 9 },
    ]);
  });

  it('skips n100, which starts above n50', () => {
    const bands = hoverBands(group('protected'), {
      [source('n100')]: { minzoom: 10 },
      [source('n50')]: { minzoom: 9 },
    });
    expect(bands.map((b) => b.source)).toEqual([source('n50')]);
  });

  it('leaves out archives that are not published', () => {
    expect(hoverBands(group('kommune'), {})).toEqual([]);
  });

  it('keeps every source of a group without scale bands', () => {
    const bands = hoverBands(group('maritime'), {
      grense200nautiskemil: { minzoom: 0 },
      tilstotendesone: { minzoom: 0 },
    });
    expect(bands.map((b) => b.maxzoom)).toEqual([undefined, undefined]);
  });
});

describe('pickFeature', () => {
  it('prefers small targets over the areas under them', () => {
    const airport = hit('airport');
    const line = hit('maritime');
    const kommune = hit('kommune');
    expect(pickFeature([kommune, line, airport])).toBe(airport);
    expect(pickFeature([kommune, line])).toBe(line);
  });

  it('ranks reserves over skytefelt over allmenninger', () => {
    const allmenning = hit('protected', 'Allmenning');
    const skytefelt = hit('protected', 'Skytefelt');
    const reserve = hit('protected', 'Naturvernområde');
    expect(pickFeature([allmenning, skytefelt])).toBe(skytefelt);
    expect(pickFeature([skytefelt, reserve])).toBe(reserve);
  });

  it('puts protected areas above the kommune under them', () => {
    const kommune = hit('kommune');
    const reserve = hit('protected', 'Naturvernområde');
    expect(pickFeature([kommune, reserve])).toBe(reserve);
  });

  it('is undefined for no features', () => {
    expect(pickFeature([])).toBeUndefined();
  });
});

describe('describe', () => {
  const kommune = {
    kommunenavn: 'Bergen',
    kommunenummer: '4601',
    fylkesnavn: 'Vestland',
    fylkesnummer: '46',
  };

  it('shows the fylke zoomed out and the kommune zoomed in', () => {
    expect(group('kommune').describe(kommune, 5).label).toBe('Vestland');
    expect(group('kommune').describe(kommune, 9).label).toBe(
      'Bergen (Vestland)',
    );
  });

  it('labels airports with their codes, and without when they are missing', () => {
    const { describe } = group('airport');
    expect(
      describe(
        { navn: 'Leknes lufthavn', iatakode: 'LKN', icaokode: 'ENLK' },
        11,
      ).label,
    ).toBe('Leknes lufthavn (LKN / ENLK)');
    expect(describe({ navn: 'Leknes lufthavn', iatakode: ' ' }, 11).label).toBe(
      'Leknes lufthavn',
    );
  });

  it('falls back to the type for maritime lines without a name', () => {
    const { describe } = group('maritime');
    expect(describe({ objtype: 'Tilstotendesone' }, 6).label).toBe(
      'Tilstotendesone',
    );
    expect(describe({ virkeomradenavn: 'Norge-Russland' }, 6).label).toBe(
      'Norge-Russland',
    );
  });
});

describe('isHoverPaused', () => {
  it('pauses for tools that work on the map', () => {
    expect(isHoverPaused('draw')).toBe(true);
    expect(isHoverPaused('measure')).toBe(true);
  });

  it('keeps hover for panels and when no tool is open', () => {
    expect(isHoverPaused('layers')).toBe(false);
    expect(isHoverPaused('settings')).toBe(false);
    expect(isHoverPaused(null)).toBe(false);
  });
});

describe('labelPoint', () => {
  const bounds = [0, 0, 10, 10];
  const cursor: [number, number] = [1, 1];

  it('uses the piece most on screen', () => {
    const [x, y] = labelPoint(
      [square(0, 0, 1), square(4, 4, 4)],
      bounds,
      cursor,
    );
    expect(x).toBeGreaterThan(4);
    expect(y).toBeGreaterThan(4);
  });

  it('falls back to the cursor when nothing is on screen', () => {
    expect(labelPoint([square(20, 20, 2)], bounds, cursor)).toEqual(cursor);
    expect(labelPoint([], bounds, cursor)).toEqual(cursor);
  });
});
