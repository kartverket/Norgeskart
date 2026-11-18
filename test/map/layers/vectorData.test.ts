import { describe, expect, it } from 'vitest';
import en from '../../../src/locales/en/translation.json';
import nb from '../../../src/locales/nb/translation.json';
import nn from '../../../src/locales/nn/translation.json';
import {
  HOVER_GROUPS,
  type Properties,
} from '../../../src/map/layers/config/backgroundLayers/hover';
import {
  activeVectorEntries,
  hoverGroupsFor,
  isVectorDataLayer,
  vectorDataConfig,
} from '../../../src/map/layers/config/themeLayers/vectorData';

describe('vector Kartdetaljer', () => {
  it('switches on the hover groups of the active entries only', () => {
    expect(hoverGroupsFor(['vectorDepths', 'hikingTrails'])).toEqual(
      new Set(['seaHazard', 'shoal', 'depthContour', 'sounding']),
    );
    expect(hoverGroupsFor([])).toEqual(new Set());
  });

  it('points every entry at hover groups that exist', () => {
    const ids = new Set(HOVER_GROUPS.map((g) => g.id));
    for (const layer of vectorDataConfig.layers) {
      expect(layer.type).toBe('vector');
      for (const group of layer.hoverGroups ?? []) expect(ids).toContain(group);
    }
  });

  it('covers every hover group with some entry', () => {
    const covered = hoverGroupsFor(vectorDataConfig.layers.map((l) => l.id));
    expect([...covered].sort()).toEqual(HOVER_GROUPS.map((g) => g.id).sort());
  });

  it('lists active entries in Kartdetaljer order', () => {
    expect(
      activeVectorEntries(['vectorRoads', 'vectorMunicipalities']).map(
        (e) => e.id,
      ),
    ).toEqual(['vectorMunicipalities', 'vectorRoads']);
    expect(isVectorDataLayer('vectorRoads')).toBe(true);
    expect(isVectorDataLayer('adresses')).toBe(false);
  });
});

describe('tooltip texts', () => {
  // Every type and field a group can produce, from properties that fill them all.
  const samples: Properties[] = [
    { objtype: 'Naturvernområde', navn: 'x' },
    { objtype: 'Skytefelt', navn: 'x' },
    { objtype: 'Allmenning', navn: 'x' },
    { objtype: 'Skjær' },
    { objtype: 'Tørrfall' },
    { objtype: 'Molo' },
    {
      navn: 'x',
      iatakode: 'A',
      icaokode: 'B',
      lufthavneier: 'C',
      adressenavn: 'x',
      vegkategori: 'E',
      vegnummer: 6,
      typeVeg: 'gangveg',
      virkeomradenavn: 'x',
      objtype: 'Tilstotendesone',
      kommunenavn: 'x',
      kommunenummer: '1',
      fylkesnavn: 'x',
      fylkesnummer: '1',
      dybde: 1,
    },
  ];
  const produced = HOVER_GROUPS.flatMap((group) =>
    samples.flatMap((p) => [5, 12].map((zoom) => group.describe(p, zoom))),
  );

  type Locale = { map: { hover: Record<string, Record<string, string>> } };

  it.each([
    ['nb', nb],
    ['nn', nn],
    ['en', en],
  ])('has every type and field in %s', (_, locale) => {
    const { hover } = (locale as unknown as Locale).map;
    for (const { type, details } of produced) {
      expect(hover.types[type], type).toBeTruthy();
      for (const [field] of details ?? []) {
        expect(hover.fields[field], field).toBeTruthy();
      }
    }
  });
});
