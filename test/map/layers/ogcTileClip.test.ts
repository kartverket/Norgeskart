import Feature from 'ol/Feature';
import { MultiLineString, MultiPolygon, Polygon } from 'ol/geom';
import { describe, expect, it } from 'vitest';
import {
  clipFeaturesToExtent,
  OUTLINE_PROPERTY,
} from '../../../src/map/layers/ogcTileClip';

const TILE = [0, 0, 10, 10];

describe('clipFeaturesToExtent', () => {
  it('clips a polygon reaching into the tile buffer to the tile', () => {
    // Square from -2..5 — the part left of x=0 is MVT buffer
    const feature = new Feature(
      new Polygon([
        [
          [-2, 2],
          [5, 2],
          [5, 8],
          [-2, 8],
          [-2, 2],
        ],
      ]),
    );
    const [clipped] = clipFeaturesToExtent([feature], TILE);
    const geom = clipped.getGeometry() as MultiPolygon;
    expect(geom.getExtent()).toEqual([0, 2, 5, 8]);
  });

  it('keeps the real ring edges as outline and drops the buffer edge', () => {
    // A polygon cut by the server at the buffer line x=-2: that edge is
    // artificial and lies outside the tile
    const feature = new Feature(
      new Polygon([
        [
          [-2, 2],
          [5, 2],
          [5, 8],
          [-2, 8],
          [-2, 2],
        ],
      ]),
    );
    const [clipped] = clipFeaturesToExtent([feature], TILE);
    const outline = clipped.get(OUTLINE_PROPERTY) as MultiLineString;
    const lines = outline.getCoordinates();
    // bottom (0..5 at y=2), right (x=5), top (5..0 at y=8); no x=0 or x=-2 edge
    expect(lines.flat().every(([x]) => x >= 0)).toBe(true);
    expect(lines.flat()).toContainEqual([5, 2]);
    expect(lines.flat()).toContainEqual([5, 8]);
    expect(lines.some((l) => l.every(([x]) => x === 0))).toBe(false);
  });

  it('drops features entirely outside the tile', () => {
    const feature = new Feature(
      new Polygon([
        [
          [11, 11],
          [12, 11],
          [12, 12],
          [11, 11],
        ],
      ]),
    );
    expect(clipFeaturesToExtent([feature], TILE)).toEqual([]);
  });
});
