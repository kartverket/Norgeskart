import { describe, expect, it } from 'vitest';
import { outlineWithoutTileCuts } from '../../../src/map/layers/config/backgroundLayers/hoverOutline';

const extent = [0, 0, 100, 100];
const ring = (points: number[][]) => points.flat();

describe('outlineWithoutTileCuts', () => {
  it('keeps a polygon that lies inside the tile whole', () => {
    const flat = ring([
      [10, 10],
      [50, 10],
      [50, 50],
      [10, 10],
    ]);
    expect(outlineWithoutTileCuts(flat, [flat.length], extent)).toEqual([
      [
        [10, 10],
        [50, 10],
        [50, 50],
        [10, 10],
      ],
    ]);
  });

  it('drops the edges where the tile cut the polygon', () => {
    // A polygon running off the tile's right side, clipped at its buffer (x = 104).
    const flat = ring([
      [50, 20],
      [104, 20],
      [104, 80],
      [50, 80],
      [50, 20],
    ]);
    const lines = outlineWithoutTileCuts(flat, [flat.length], extent);
    expect(lines).toEqual([
      [
        [50, 20],
        [104, 20],
      ],
      [
        [104, 80],
        [50, 80],
        [50, 20],
      ],
    ]);
  });

  it('keeps real slanted edges near the border', () => {
    const flat = ring([
      [90, 0],
      [101, 50],
      [90, 100],
    ]);
    expect(outlineWithoutTileCuts(flat, [flat.length], extent)).toHaveLength(1);
  });

  it('walks every ring', () => {
    const outer = ring([
      [10, 10],
      [90, 10],
      [90, 90],
      [10, 10],
    ]);
    const hole = ring([
      [40, 40],
      [60, 40],
      [60, 60],
      [40, 40],
    ]);
    const flat = [...outer, ...hole];
    expect(
      outlineWithoutTileCuts(flat, [outer.length, flat.length], extent),
    ).toHaveLength(2);
  });
});
