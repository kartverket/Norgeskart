import { describe, expect, it } from 'vitest';
import { getLegendGraphicUrls } from '../../../src/map/layers/themeLayerConfigApi';

const layerParam = (url: string) => new URL(url).searchParams.get('LAYER');

describe('getLegendGraphicUrls', () => {
  it('returns one URL per layer, since GetLegendGraphic is single-layer', () => {
    const urls = getLegendGraphicUrls(
      'https://wms.geonorge.no/skwms1/wms.matrikkelkart',
      'eiendomsgrense, teig ,',
    );
    expect(urls.map(layerParam)).toEqual(['eiendomsgrense', 'teig']);
  });

  it('sets the GetLegendGraphic request parameters', () => {
    const [url] = getLegendGraphicUrls('https://example.no/wms', 'a');
    const params = new URL(url).searchParams;
    expect(params.get('SERVICE')).toBe('WMS');
    expect(params.get('REQUEST')).toBe('GetLegendGraphic');
    expect(params.get('FORMAT')).toBe('image/png');
  });

  it('keeps existing query parameters and encodes layer names', () => {
    const [url] = getLegendGraphicUrls(
      'https://wms.nibio.no/cgi-bin/jordsmonn?map=x',
      'Saltholdighet i vannmassene',
    );
    const params = new URL(url).searchParams;
    expect(params.get('map')).toBe('x');
    expect(layerParam(url)).toBe('Saltholdighet i vannmassene');
    expect(url).not.toContain(' ');
  });
});
