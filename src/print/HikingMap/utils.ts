import { Coordinate } from 'ol/coordinate';
import type { Extent } from 'ol/extent';
import type Map from 'ol/Map';

/**
 * Returns the overlay element's four corners in MAP PIXELS (relative to the map viewport),
 * correctly accounting for CSS transforms (rotation, etc.) when possible.
 * The returned array contains 4 pixel points in DOM order (clockwise), but do not assume TL/BR/etc.
 */
export function getOverlayCornersInPixels(
  el: HTMLElement,
  map: Map,
): [number, number][] {
  const viewportEl = map.getViewport();
  const viewportRect = viewportEl.getBoundingClientRect();

  // Fallback: derive rotation from computed transform matrix
  // Assumptions: transform-origin is at center; transform is primarily rotate(...)
  const rect = el.getBoundingClientRect();

  const centerPx: [number, number] = [
    rect.left + rect.width / 2 - viewportRect.left,
    rect.top + rect.height / 2 - viewportRect.top,
  ];

  const cs = getComputedStyle(el);
  const tf = cs.transform || 'none';

  let angle = 0; // radians
  if (tf !== 'none') {
    // DOMMatrixReadOnly parses CSS transform matrices
    const m = new DOMMatrixReadOnly(tf);
    angle = Math.atan2(m.b, m.a); // rotation inferred from matrix
  }

  const w2 = rect.width / 2;
  const h2 = rect.height / 2;

  // Unrotated local corners around center
  const local: [number, number][] = [
    [-w2, -h2], // top-left
    [w2, -h2], // top-right
    [w2, h2], // bottom-right
    [-w2, h2], // bottom-left
  ];

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const rotate = (x: number, y: number): [number, number] => [
    x * cos - y * sin,
    x * sin + y * cos,
  ];

  return local.map(([x, y]) => {
    const [xr, yr] = rotate(x, y);
    return [centerPx[0] + xr, centerPx[1] + yr] as [number, number];
  });
}

/** Convert an array of pixels [[x,y], ...] to map coordinates in the view’s projection (CRS). */
export function pixelsToCoordinates(
  map: Map,
  pixels: [number, number][],
): Coordinate[] {
  return pixels.map((px) => map.getCoordinateFromPixel(px) as Coordinate);
}

/** Compute axis-aligned extent [minX, minY, maxX, maxY] from coordinates. */
export function coordinatesToExtent(coords: Coordinate[]): Extent {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

/**
 * High-level helper:
 * - corners: the four overlay corner coordinates (rotated quad) in the map’s CRS.
 * - extent: axis-aligned extent that bounds the rotated quad.
 */
export function getOverlayFootprint(
  map: Map,
  overlayElement: HTMLElement,
): { corners: Coordinate[]; extent: Extent } {
  const pxCorners = getOverlayCornersInPixels(overlayElement, map);
  const corners = pixelsToCoordinates(map, pxCorners);
  const extent = coordinatesToExtent(corners);
  return { corners, extent };
}
