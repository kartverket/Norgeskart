import { describe, expect, it } from 'vitest';
import { scaleRangeStatus } from '../../../src/map/layers/urlWms';

describe('scaleRangeStatus', () => {
  it('is visible when the layer has no scale limits', () => {
    expect(scaleRangeStatus(10_000_000, {})).toBe('visible');
  });

  it('asks to zoom in above MaxScaleDenominator (NVE "Dam": 1:75 596)', () => {
    const dam = { maxScale: 75_596 };
    expect(scaleRangeStatus(2_000_000, dam)).toBe('zoomIn');
    expect(scaleRangeStatus(50_000, dam)).toBe('visible');
  });

  it('treats MaxScaleDenominator as exclusive, like WMS servers do', () => {
    expect(scaleRangeStatus(75_596, { maxScale: 75_596 })).toBe('zoomIn');
  });

  it('asks to zoom out below MinScaleDenominator', () => {
    const overview = { minScale: 250_000 };
    expect(scaleRangeStatus(100_000, overview)).toBe('zoomOut');
    expect(scaleRangeStatus(250_000, overview)).toBe('visible');
  });
});
