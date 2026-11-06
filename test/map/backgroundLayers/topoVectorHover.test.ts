import { describe, expect, it } from 'vitest';
import {
  highlightFilter,
  hoverBands,
  labelPoint,
  pickFeature,
} from '../../../src/map/layers/config/backgroundLayers/topoVectorHover';

const source = (scale: string) => `${scale}_restriksjonsomrader_flate`;
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
  it('gives each zoom one archive, ending where the next finer one starts', () => {
    expect(
      hoverBands({
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
    const bands = hoverBands({
      [source('n100')]: { minzoom: 10 },
      [source('n50')]: { minzoom: 9 },
    });
    expect(bands.map((b) => b.source)).toEqual([source('n50')]);
  });
});

describe('pickFeature', () => {
  const allmenning = { properties: { objtype: 'Allmenning' } };
  const reserve = { properties: { objtype: 'Naturvernområde' } };

  it('prefers the reserve inside an allmenning', () => {
    expect(pickFeature([allmenning, reserve])).toBe(reserve);
  });

  it('is undefined for no features', () => {
    expect(pickFeature([])).toBeUndefined();
  });
});

describe('highlightFilter', () => {
  it('matches both name and type', () => {
    expect(highlightFilter('Allmenning', 'Ulvik')).toEqual([
      'all',
      ['==', ['get', 'objtype'], 'Allmenning'],
      ['==', ['get', 'navn'], 'Ulvik'],
    ]);
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
