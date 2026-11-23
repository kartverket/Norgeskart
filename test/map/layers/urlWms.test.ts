import { createStore } from 'jotai';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { htmlFeaturesToText } from '../../../src/map/featureInfo/featureInfoService';
import {
  createGeonorgeLayer,
  wmsFromCatalogRecord,
} from '../../../src/map/layers/geonorgeLayers';
import {
  assignZIndices,
  claimUrlWmsLoadAtom,
  createUrlWmsLayer,
  createVerifiedWmsLayer,
  getWmsLayerNames,
  layersForLeaves,
  parseWmsCapabilities,
  parseWmsUrl,
  selectedLeaves,
  selectWmsNodes,
} from '../../../src/map/layers/urlWms';
import {
  formatGeonorgeToken,
  parseGeonorgeParam,
  serializeUrlWmsLayers,
} from '../../../src/map/layers/urlWmsState';
import { processUrlParameters } from '../../../src/urlNormalization';

const UUID = '11111111-2222-3333-4444-555555555555';

const caps = (rootName = '') => `<?xml version="1.0"?>
<WMS_Capabilities xmlns="http://www.opengis.net/wms" version="1.3.0"><Capability>
<Layer>${rootName && `<Name>${rootName}</Name>`}<Title>Service</Title><CRS>EPSG:25833</CRS>
  <Layer queryable="1"><Name>a</Name><Title>Alpha lag</Title><MaxScaleDenominator>50000</MaxScaleDenominator></Layer>
  <Layer><Name>g</Name><Title>Group</Title>
    <Layer><Name>b</Name><Title>Beta</Title></Layer>
    <Layer><Name>c</Name><Title>Gamma</Title></Layer>
  </Layer>
</Layer></Capability></WMS_Capabilities>`;
const names = (nodes: { name?: string }[]) => nodes.map((n) => n.name);

afterEach(() => vi.unstubAllGlobals());

describe('parseWmsUrl', () => {
  it('strips protocol params in any case and extracts LAYERS', () => {
    expect(
      parseWmsUrl('https://x.no/wms?map=m&Service=WMS&REQUEST=x&layers=a,b'),
    ).toEqual({ baseUrl: 'https://x.no/wms?map=m', layers: ['a', 'b'] });
  });
  it('upgrades http and rejects other schemes', () => {
    expect(parseWmsUrl('http://x.no/wms')?.baseUrl).toBe('https://x.no/wms');
    expect(parseWmsUrl('javascript:alert(1)')).toBeNull();
    expect(parseWmsUrl('nope')).toBeNull();
  });
});

describe('selectWmsNodes', () => {
  const root = parseWmsCapabilities(caps());
  it('keeps only names the service has, ignoring workspace prefixes', () => {
    expect(names(selectWmsNodes(root, ['ws:b', 'geojson']))).toEqual(['b']);
  });
  it('prefers a title match over the catalog name', () => {
    expect(names(selectWmsNodes(root, ['b'], 'Alpha lag WMS', true))).toEqual([
      'a',
    ]);
  });
  it('uses the title when a servicelayer name is outdated', () => {
    expect(names(selectWmsNodes(root, ['gone'], 'Beta'))).toEqual(['b']);
  });
  it('never guesses a specific layer among many', () => {
    const many = {
      ...root,
      children: Array.from({ length: 30 }, (_, i) => ({
        ...root.children[0],
        name: `n${i}`,
      })),
    };
    expect(selectWmsNodes(many, ['gone'], 'x')).toEqual([]);
    expect(names(selectWmsNodes(many, []))).toEqual(['n0']);
  });
  it('falls back to the whole service', () => {
    expect(names(selectWmsNodes(root, ['zzz']))).toEqual(['a', 'g']);
    const named = parseWmsCapabilities(caps('root'));
    expect(names(selectWmsNodes(named, []))).toEqual(['root']);
  });
});

describe('layer picker', () => {
  const root = parseWmsCapabilities(caps('root'));
  it('expands groups and collapses to the root name', () => {
    expect([...selectedLeaves(root, ['g'])]).toEqual(['b', 'c']);
    expect(layersForLeaves(root, new Set(['c', 'a']))).toEqual(['a', 'c']);
    expect(layersForLeaves(root, new Set(['a', 'b', 'c']))).toEqual(['root']);
  });
});

describe('?geonorge=', () => {
  it('round-trips awkward layer names', () => {
    const token = { id: UUID, layers: ['a,b', 'x~y', 'æ 1'] };
    expect(parseGeonorgeParam(formatGeonorgeToken(token))).toEqual([token]);
  });
  it('drops duplicates and invalid ids, keeps met.no ids', () => {
    const met = `no.met.adc:${UUID}`;
    expect(
      parseGeonorgeParam(`${UUID},${UUID},a/../b,,${met}`).map((t) => t.id),
    ).toEqual([UUID, met]);
  });
  it('serializes catalog layers by id and others by address', () => {
    const make = (layers: string, props = {}) =>
      createVerifiedWmsLayer('https://x.no/w', layers, 'EPSG:3857', props);
    expect(
      serializeUrlWmsLayers([
        make('a', { geonorgeId: UUID }),
        make('b', { geonorgeId: 'id2', defaultLayers: 'a' }),
        make('c,d'),
      ]),
    ).toEqual({
      geonorge: [UUID, 'id2~b'],
      wmsUrls: ['https://x.no/w?LAYERS=c%2Cd'],
    });
  });
  it('resolves an unlisted id through the catalog', async () => {
    const fetchMock = vi.fn((url: string | URL) =>
      Promise.resolve(
        String(url).includes('/api/getdata/')
          ? Response.json({
              Title: 'Min beta',
              DistributionDetails: {
                Protocol: 'OGC:WMS',
                URL: 'https://catalog-test.no/wms',
                Name: 'b',
              },
            })
          : new Response(caps()),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const layer = await createGeonorgeLayer({ id: UUID }, 'EPSG:25833');
    expect(getWmsLayerNames(layer)).toEqual(['b']);
    expect(layer.get('layerTitle')).toBe('Min beta');
    expect(serializeUrlWmsLayers([layer]).geonorge).toEqual([UUID]);
  });
});

describe('wmsFromCatalogRecord', () => {
  it('uses linked services and returns null without WMS', () => {
    expect(
      wmsFromCatalogRecord({
        Title: 'T',
        DatasetServicesWithShowMapLink: [
          { DistributionProtocol: 'WFS-tjeneste', GetCapabilitiesUrl: 'f' },
          { DistributionProtocol: 'WMS-tjeneste', GetCapabilitiesUrl: 'w' },
        ],
      }),
    ).toEqual({ url: 'w', wanted: [], matchTitle: 'T', titleFirst: true });
    expect(
      wmsFromCatalogRecord({ DistributionDetails: { Protocol: 'OGC:WFS' } }),
    ).toBeNull();
  });
});

describe('createUrlWmsLayer', () => {
  it('throws without capabilities unless layer names are explicit', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new Error('CORS')));
    const projection = 'EPSG:25833';
    await expect(
      createUrlWmsLayer({ url: 'https://down.no/w', projection }),
    ).rejects.toThrow();
    const layer = await createUrlWmsLayer({
      url: 'https://down.no/w?LAYERS=q',
      projection,
      allowUnverified: true,
    });
    expect(getWmsLayerNames(layer)).toEqual(['q']);
  });
  it('keeps z-indices in [8, 9) and ids unique', () => {
    const layers = Array.from({ length: 25 }, () =>
      createVerifiedWmsLayer('https://x.no/w', 'a', 'EPSG:3857'),
    );
    assignZIndices(layers);
    expect(Math.max(...layers.map((l) => l.getZIndex()!))).toBeLessThan(9);
    expect(new Set(layers.map((l) => l.get('id'))).size).toBe(25);
  });
});

describe('claimUrlWmsLoadAtom', () => {
  it('lets only the first caller load', () => {
    const store = createStore();
    expect(store.set(claimUrlWmsLoadAtom)).toBe(true);
    expect(store.set(claimUrlWmsLoadAtom)).toBe(false);
  });
});

describe('legacy kartkatalog links', () => {
  it('keeps addLayers as WMS layer names', () => {
    window.history.replaceState(
      {},
      '',
      '/#!?zoom=4&wms=https://x.no/wms&addLayers=vern',
    );
    processUrlParameters();
    const params = new URLSearchParams(window.location.search);
    expect(params.get('wmsUrl')).toBe('https://x.no/wms?LAYERS=vern');
    expect(params.has('addLayers')).toBe(false);
  });
});

describe('htmlFeaturesToText', () => {
  it('never returns markup', () => {
    expect(
      htmlFeaturesToText([
        { properties: { _html: '<b>Hei</b><script>x()</script><img src=x>' } },
      ])[0].properties,
    ).toEqual({ info: 'Hei' });
  });
});
