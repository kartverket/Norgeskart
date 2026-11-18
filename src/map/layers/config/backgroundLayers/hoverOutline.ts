import type { Extent } from 'ol/extent';

/**
 * A polygon's outline without the cuts made by tiling. Each tile clips polygons at
 * its (buffered) border, so stroking every ring would draw the tile grid. Those
 * cuts are axis-aligned segments on or outside the tile's own extent; the real
 * boundary there comes from the neighbouring tile, where it lies inside.
 *
 * flat/ends are a RenderFeature's polygon rings in tile projection.
 * Returns the remaining edges as polylines, in the same projection.
 */
export const outlineWithoutTileCuts = (
  flat: number[],
  ends: number[],
  [minX, minY, maxX, maxY]: Extent,
  stride = 2,
): number[][][] => {
  const tolerance = (maxX - minX) * 1e-9;
  const onCut = (x1: number, y1: number, x2: number, y2: number) =>
    (x1 === x2 && (x1 <= minX + tolerance || x1 >= maxX - tolerance)) ||
    (y1 === y2 && (y1 <= minY + tolerance || y1 >= maxY - tolerance));

  const lines: number[][][] = [];
  let start = 0;
  for (const end of ends) {
    let line: number[][] = [];
    for (let i = start; i + stride < end; i += stride) {
      const [x1, y1, x2, y2] = [
        flat[i],
        flat[i + 1],
        flat[i + stride],
        flat[i + stride + 1],
      ];
      if (onCut(x1, y1, x2, y2)) {
        if (line.length > 1) lines.push(line);
        line = [];
        continue;
      }
      if (line.length === 0) line.push([x1, y1]);
      line.push([x2, y2]);
    }
    if (line.length > 1) lines.push(line);
    start = end;
  }
  return lines;
};
