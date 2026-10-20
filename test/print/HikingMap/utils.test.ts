import Map from 'ol/Map';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { getOverlayCornersInPixels } from '../../../src/print/HikingMap/utils';

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('getOverlayCornersInPixels', () => {
  it('reports a missing viewport', () => {
    const map = new Map({});
    vi.spyOn(map, 'getViewport').mockReturnValue(undefined);

    expect(() =>
      getOverlayCornersInPixels(document.createElement('div'), map),
    ).toThrow('Cannot determine hiking map footprint without a map viewport');
  });

  it('returns overlay corners relative to the viewport', () => {
    const map = new Map({});
    const viewport = document.createElement('div');
    vi.spyOn(map, 'getViewport').mockReturnValue(viewport);
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(10, 20, 100, 100),
    );

    const overlay = document.createElement('div');
    vi.spyOn(overlay, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(30, 40, 20, 10),
    );

    expect(getOverlayCornersInPixels(overlay, map)).toEqual([
      [20, 20],
      [40, 20],
      [40, 30],
      [20, 30],
    ]);
  });
});
