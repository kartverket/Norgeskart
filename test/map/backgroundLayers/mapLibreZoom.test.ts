import { View } from 'ol';
import { fromLonLat, getPointResolution } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  gridConvergence,
  mercatorZoom,
  mercatorZoomForView,
} from '../../../src/map/layers/config/backgroundLayers/mapLibreZoom';

const groundResolutionAt = (zoom: number, latitude: number) =>
  (40075016.68557849 * Math.cos((latitude * Math.PI) / 180)) /
  (512 * 2 ** (zoom - 1));

describe('mercatorZoom', () => {
  it('is the renderer zoom whose ground scale equals the requested one', () => {
    const zoom = mercatorZoom(2.5, 60.39);
    expect(groundResolutionAt(zoom, 60.39)).toBeCloseTo(2.5, 9);
  });

  it('needs a lower zoom further north for the same ground resolution', () => {
    expect(mercatorZoom(10, 70)).toBeLessThan(mercatorZoom(10, 58));
  });
});

describe('mercatorZoomForView', () => {
  beforeAll(() => {
    proj4.defs(
      'EPSG:25833',
      '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs',
    );
    register(proj4);
  });

  it('equals the plain OL zoom in EPSG:3857, where the two scales coincide', () => {
    const view = new View({
      projection: 'EPSG:3857',
      center: fromLonLat([10.75, 59.91]),
      zoom: 12,
    });
    expect(mercatorZoomForView(view)).toBeCloseTo(12, 2);
  });

  it('matches the true ground scale of an EPSG:25833 view', () => {
    const center: [number, number] = [-32300, 6730000];
    const view = new View({
      projection: 'EPSG:25833',
      center,
      resolution: 2.6,
    });
    const zoom = mercatorZoomForView(view)!;
    const ground = getPointResolution('EPSG:25833', 2.6, center, 'm');
    const latitude = (proj4('EPSG:25833', 'EPSG:4326', center) as number[])[1];
    expect(groundResolutionAt(zoom, latitude) / ground).toBeCloseTo(1, 6);
  });

  it('returns undefined before the view has a center', () => {
    expect(
      mercatorZoomForView(new View({ projection: 'EPSG:3857' })),
    ).toBeUndefined();
  });

  it('has no convergence on the central meridian or in EPSG:3857', () => {
    const utm = new View({
      projection: 'EPSG:25833',
      center: [500000, 6650000],
      resolution: 10,
    });
    expect(gridConvergence(utm)).toBeCloseTo(0, 1);
    const mercator = new View({
      projection: 'EPSG:3857',
      center: fromLonLat([5.3, 60.4]),
      resolution: 10,
    });
    expect(gridConvergence(mercator)).toBeCloseTo(0, 6);
  });

  it('turns opposite ways west and east of the central meridian', () => {
    const at = (center: number[]) =>
      gridConvergence(
        new View({ projection: 'EPSG:25833', center, resolution: 10 }),
      );
    expect(at([-32300, 6730000])).toBeGreaterThan(7);
    expect(at([1060000, 7800000])).toBeLessThan(-10);
  });
});
