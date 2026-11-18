import { describe, expect, it } from 'vitest';
import {
  HOVER_GROUPS,
  hoverBands,
  inBand,
  isHoverPaused,
  kindOf,
  pickFeature,
} from '../../../src/map/layers/config/backgroundLayers/hover';

const group = (id: string) => HOVER_GROUPS.find((g) => g.id === id)!;
const source = (scale: string) => `${scale}_restriksjonsomrader_flate`;
const hit = (id: string, objtype = '') => ({
  group: group(id),
  properties: { objtype },
});

describe('hoverBands', () => {
  it('gives each zoom one archive when the group has scale bands', () => {
    expect(
      hoverBands(group('protected'), {
        [source('n5000')]: { minzoom: 0 },
        [source('n250')]: { minzoom: 8 },
        [source('n50')]: { minzoom: 9 },
        unrelated: { minzoom: 3 },
      }),
    ).toEqual([
      { source: source('n5000'), minzoom: 0, maxzoom: 8 },
      { source: source('n250'), minzoom: 8, maxzoom: 9 },
      { source: source('n50'), minzoom: 9 },
    ]);
  });

  it('skips n100, which starts above n50', () => {
    const bands = hoverBands(group('protected'), {
      [source('n100')]: { minzoom: 10 },
      [source('n50')]: { minzoom: 9 },
    });
    expect(bands.map((b) => b.source)).toEqual([source('n50')]);
  });

  it('leaves out archives that are not published', () => {
    expect(hoverBands(group('kommune'), {})).toEqual([]);
  });

  it('keeps every source of a group without scale bands', () => {
    const bands = hoverBands(group('maritime'), {
      grense200nautiskemil: { minzoom: 0 },
      tilstotendesone: { minzoom: 0 },
    });
    expect(bands.map((b) => b.maxzoom)).toEqual([undefined, undefined]);
  });
});

describe('pickFeature', () => {
  it('prefers small targets over the areas under them', () => {
    const airport = hit('airport');
    const line = hit('maritime');
    const kommune = hit('kommune');
    expect(pickFeature([kommune, line, airport])).toBe(airport);
    expect(pickFeature([kommune, line])).toBe(line);
  });

  it('ranks reserves over skytefelt over allmenninger', () => {
    const allmenning = hit('protected', 'Allmenning');
    const skytefelt = hit('protected', 'Skytefelt');
    const reserve = hit('protected', 'Naturvernområde');
    expect(pickFeature([allmenning, skytefelt])).toBe(skytefelt);
    expect(pickFeature([skytefelt, reserve])).toBe(reserve);
  });

  it('puts protected areas above the kommune under them', () => {
    const kommune = hit('kommune');
    const reserve = hit('protected', 'Naturvernområde');
    expect(pickFeature([kommune, reserve])).toBe(reserve);
  });

  it('is undefined for no features', () => {
    expect(pickFeature([])).toBeUndefined();
  });
});

describe('describe', () => {
  const kommune = {
    kommunenavn: 'Bergen',
    kommunenummer: '4601',
    fylkesnavn: 'Vestland',
    fylkesnummer: '46',
  };

  it('shows the fylke zoomed out and the kommune zoomed in', () => {
    const fylke = group('kommune').describe(kommune, 5);
    expect([fylke.type, fylke.label]).toEqual(['county', 'Vestland']);
    const own = group('kommune').describe(kommune, 9);
    expect([own.type, own.label]).toEqual(['municipality', 'Bergen']);
    expect(own.details).toEqual([
      ['county', 'Vestland'],
      ['municipalityNumber', '4601'],
    ]);
  });

  it('highlights every kommune of the fylke zoomed out, only the one zoomed in', () => {
    const askoy = { ...kommune, kommunenummer: '4627', kommunenavn: 'Askøy' };
    const molde = { ...kommune, fylkesnummer: '15', kommunenummer: '1506' };
    const fylke = group('kommune').describe(kommune, 5);
    expect(fylke.matches(askoy)).toBe(true);
    expect(fylke.matches(molde)).toBe(false);
    const own = group('kommune').describe(kommune, 9);
    expect(own.matches(kommune)).toBe(true);
    expect(own.matches(askoy)).toBe(false);
  });

  it('names airports and lists only the codes they have', () => {
    const { describe } = group('airport');
    const leknes = describe(
      { navn: 'Leknes lufthavn', iatakode: 'LKN', icaokode: 'ENLK' },
      11,
    );
    expect([leknes.type, leknes.label]).toEqual(['airport', 'Leknes lufthavn']);
    expect(leknes.details).toEqual([
      ['iata', 'LKN'],
      ['icao', 'ENLK'],
    ]);
    expect(
      describe({ navn: 'Leknes lufthavn', iatakode: ' ' }, 11).details,
    ).toEqual([]);
  });

  it('falls back to the type for maritime lines without a name', () => {
    const { describe } = group('maritime');
    expect(describe({ objtype: 'Tilstotendesone' }, 6).label).toBe(
      'Tilstotendesone',
    );
    expect(describe({ virkeomradenavn: 'Norge-Russland' }, 6).label).toBe(
      'Norge-Russland',
    );
  });
});

describe('inBand', () => {
  it('includes the band minzoom and excludes its maxzoom', () => {
    expect(inBand({ minzoom: 8, maxzoom: 9 }, 8)).toBe(true);
    expect(inBand({ minzoom: 8, maxzoom: 9 }, 9)).toBe(false);
    expect(inBand({ minzoom: 8 }, 15)).toBe(true);
    expect(inBand({ minzoom: 8 }, 7.9)).toBe(false);
  });
});

describe('filter', () => {
  it('only lets airports with a name be hit', () => {
    const { filter } = group('airport');
    expect(filter!({ objtype: 'Lufthavn', navn: 'Leknes lufthavn' })).toBe(
      true,
    );
    expect(filter!({ objtype: 'Lufthavn' })).toBe(false);
    expect(filter!({ objtype: 'Helikopterlandingsplass', navn: 'X' })).toBe(
      false,
    );
  });
});

describe('isHoverPaused', () => {
  it('pauses for tools that work on the map', () => {
    expect(isHoverPaused('draw')).toBe(true);
    expect(isHoverPaused('measure')).toBe(true);
  });

  it('keeps hover for panels and when no tool is open', () => {
    expect(isHoverPaused('layers')).toBe(false);
    expect(isHoverPaused('settings')).toBe(false);
    expect(isHoverPaused(null)).toBe(false);
  });
});

describe('batch 1 groups', () => {
  it('only loads dense data close up', () => {
    expect(
      hoverBands(group('address'), { matrikkelen_vegadresse: { minzoom: 0 } }),
    ).toEqual([{ source: 'matrikkelen_vegadresse', minzoom: 15 }]);
    expect(
      hoverBands(group('road'), { nvdb_veglenke: { minzoom: 0 } })[0].minzoom,
    ).toBe(12);
  });

  it('keeps an archive minzoom above the group one', () => {
    expect(
      hoverBands(group('road'), { nvdb_veglenke: { minzoom: 13 } })[0].minzoom,
    ).toBe(13);
  });

  it('labels addresses with number and letter', () => {
    const { describe } = group('address');
    const storgata = {
      adressenavn: 'Storgata',
      adressekode: 1234,
      nummer: 5,
      bokstav: 'B',
    };
    const hovered = describe(storgata, 16);
    expect(hovered.label).toBe('Storgata 5B');
    expect(hovered.matches(storgata)).toBe(true);
    expect(hovered.matches({ ...storgata, bokstav: 'A' })).toBe(false);
    expect(describe({ adressenavn: 'Storgata', nummer: 7 }, 16).label).toBe(
      'Storgata 7',
    );
  });

  it('names streets, numbers roads and falls back to the road type', () => {
    const { describe } = group('road');
    const street = {
      adressenavn: 'Trondheimsveien',
      vegkategori: 'R',
      vegnummer: 4,
    };
    expect(describe(street, 14).label).toBe('Trondheimsveien (Rv. 4)');
    expect(describe({ vegkategori: 'E', vegnummer: 6 }, 14).label).toBe('E 6');
    expect(describe({ typeVeg: 'gangveg', nvdbId: 9 }, 14).label).toBe(
      'Gangveg',
    );
    // Kommunal road numbers mean nothing to users.
    expect(
      describe(
        { adressenavn: 'Apotekergata', vegkategori: 'K', vegnummer: 10203 },
        14,
      ).label,
    ).toBe('Apotekergata');
  });

  it('highlights the whole street or road number, not just one link', () => {
    const { describe } = group('road');
    const street = describe({ adressenavn: 'Storgata', nvdbId: 1 }, 14);
    expect(street.matches({ adressenavn: 'Storgata', nvdbId: 2 })).toBe(true);
    const e6 = describe({ vegkategori: 'E', vegnummer: 6 }, 14);
    expect(e6.matches({ vegkategori: 'E', vegnummer: 6, nvdbId: 3 })).toBe(
      true,
    );
    expect(e6.matches({ vegkategori: 'R', vegnummer: 6 })).toBe(false);
  });

  it('writes depths in metres with a decimal comma, the kind in the type', () => {
    const shoal = group('shoal').describe({ dybde: 0.6, lokalid: 'a' }, 14);
    expect([shoal.type, shoal.label]).toEqual(['shoal', '0,6 m']);
    expect(
      group('sounding').describe({ dybde: 12, lokalid: 'b' }, 14).label,
    ).toBe('12 m');
    expect(group('depthContour').describe({ dybde: 10 }, 12).type).toBe(
      'depthContour',
    );
  });

  it('types sea hazards and protected areas by what they are', () => {
    expect(
      group('seaHazard').describe({ objtype: 'Skjær', lokalid: 'c' }, 12).type,
    ).toBe('reef');
    expect(
      group('protected').describe(
        { objtype: 'Skytefelt', navn: 'Regionfelt' },
        10,
      ).type,
    ).toBe('firingRange');
  });

  it('draws each sea hazard archive as its own geometry', () => {
    const hazards = group('seaHazard');
    expect(kindOf(hazards, 'dybdedata_skjer')).toBe('circle');
    expect(kindOf(hazards, 'dybdedata_torrfall')).toBe('fill');
    expect(kindOf(hazards, 'dybdedata_molo')).toBe('line');
    expect(kindOf(group('kommune'), 'n50_adm_kommune_flate')).toBe('fill');
  });

  it('ranks shoals over contours, and contours over soundings', () => {
    const sounding = hit('sounding');
    const contour = hit('depthContour');
    const shoal = hit('shoal');
    expect(pickFeature([sounding, contour, shoal])).toBe(shoal);
    expect(pickFeature([sounding, contour])).toBe(contour);
  });

  it('prefers addresses over roads, and roads over the kommune', () => {
    const address = hit('address');
    const road = hit('road');
    const kommune = hit('kommune');
    expect(pickFeature([kommune, road, address])).toBe(address);
    expect(pickFeature([kommune, road])).toBe(road);
  });
});
