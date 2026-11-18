import {
  ThemeLayerConfig,
  ThemeLayerDefinition,
} from '../../themeLayerConfigApi';
import { type UserStyle, widthScale } from '../../userStyles';
import { HOVER_GROUPS } from '../backgroundLayers/hover';
import type { GroupStyle } from '../backgroundLayers/hoverEngine';

// Kartdetaljer backed by our own vector tiles (tnt-martin). Switching one on makes
// its hover groups (backgroundLayers/hover.ts) hoverable and clickable. Martin is
// internal-only, so the category is hidden when it can't be reached.
export const VECTOR_DATA_CATEGORY = 'vectorData';
const GROUP_ID = 20;

export type VectorDataLayerName =
  | 'vectorMunicipalities'
  | 'vectorProtectedAreas'
  | 'vectorMaritimeBorders'
  | 'vectorDepths'
  | 'vectorAddresses'
  | 'vectorRoads'
  | 'vectorAirports';

export type VectorEntry = {
  id: VectorDataLayerName;
  name: ThemeLayerDefinition['name'];
  // For the bottom-bar chip.
  short: ThemeLayerDefinition['name'];
  color: string;
  hoverGroups: string[];
};

const ENTRIES: VectorEntry[] = [
  {
    id: 'vectorMunicipalities',
    short: { nb: 'Kommuner', nn: 'Kommunar', en: 'Municipalities' },
    color: '#37474f',
    name: {
      nb: 'Kommuner og fylker',
      nn: 'Kommunar og fylke',
      en: 'Municipalities and counties',
    },
    hoverGroups: ['kommune'],
  },
  {
    id: 'vectorProtectedAreas',
    short: { nb: 'Verneområder', nn: 'Verneområde', en: 'Protected areas' },
    color: '#2e7d32',
    name: {
      nb: 'Verneområder, skytefelt og allmenninger',
      nn: 'Verneområde, skytefelt og allmenningar',
      en: 'Protected areas, firing ranges and commons',
    },
    hoverGroups: ['protected'],
  },
  {
    id: 'vectorMaritimeBorders',
    short: {
      nb: 'Maritime grenser',
      nn: 'Maritime grenser',
      en: 'Maritime borders',
    },
    color: '#00695c',
    name: {
      nb: 'Maritime grenser',
      nn: 'Maritime grenser',
      en: 'Maritime borders',
    },
    hoverGroups: ['maritime'],
  },
  {
    id: 'vectorDepths',
    short: { nb: 'Dybder', nn: 'Djupner', en: 'Depths' },
    color: '#01579b',
    name: {
      nb: 'Dybder og farer i sjøen',
      nn: 'Djupner og farar i sjøen',
      en: 'Depths and hazards at sea',
    },
    hoverGroups: ['seaHazard', 'shoal', 'depthContour', 'sounding'],
  },
  {
    id: 'vectorAddresses',
    short: { nb: 'Adresser', nn: 'Adresser', en: 'Addresses' },
    color: '#6a1b9a',
    name: { nb: 'Adresser', nn: 'Adresser', en: 'Addresses' },
    hoverGroups: ['address'],
  },
  {
    id: 'vectorRoads',
    short: { nb: 'Veger', nn: 'Vegar', en: 'Roads' },
    color: '#e65100',
    name: { nb: 'Veger', nn: 'Vegar', en: 'Roads' },
    hoverGroups: ['road'],
  },
  {
    id: 'vectorAirports',
    short: { nb: 'Lufthavner', nn: 'Lufthamner', en: 'Airports' },
    color: '#1565c0',
    name: { nb: 'Lufthavner', nn: 'Lufthamner', en: 'Airports' },
    hoverGroups: ['airport'],
  },
];

export const vectorDataConfig: ThemeLayerConfig = {
  categories: [
    {
      id: VECTOR_DATA_CATEGORY,
      groupid: GROUP_ID,
      name: {
        nb: 'Interaktive kartdata (test)',
        nn: 'Interaktive kartdata (test)',
        en: 'Interactive map data (test)',
      },
    },
  ],
  layers: ENTRIES.map(({ id, name, hoverGroups }) => ({
    id,
    name,
    hoverGroups,
    type: 'vector',
    categoryId: VECTOR_DATA_CATEGORY,
    groupid: GROUP_ID,
    queryable: false,
    noLegend: true,
  })),
};

export const isVectorDataLayer = (id: string): id is VectorDataLayerName =>
  ENTRIES.some((entry) => entry.id === id);

/** The hover groups switched on by the given active Kartdetaljer. */
export const hoverGroupsFor = (activeLayers: Iterable<string>) =>
  new Set(
    [...activeLayers].flatMap(
      (id) => ENTRIES.find((entry) => entry.id === id)?.hoverGroups ?? [],
    ),
  );

/** Active vector entries, in list order, with the groups they switch on. */
export const activeVectorEntries = (activeLayers: Iterable<string>) => {
  const active = new Set(activeLayers);
  return ENTRIES.filter((entry) => active.has(entry.id));
};

const groupDisplays = (entry: VectorEntry) =>
  entry.hoverGroups.some(
    (id) => HOVER_GROUPS.find((group) => group.id === id)?.display,
  );

/** Whether an entry is drawn on the map (not just on hover) unless the user says otherwise. */
export const shownByDefault = (id: string) => {
  const entry = ENTRIES.find((e) => e.id === id);
  return entry ? groupDisplays(entry) : false;
};

/** The colour an entry shows in, the user's or its own. */
export const entryColor = (entry: VectorEntry, style?: UserStyle) =>
  style?.color ?? entry.color;

/**
 * Each hover group's look from the user's style per Kartdetalj. An entry covering
 * several groups (Dybder) styles them all; drawing defaults to each group's own.
 */
export const groupStylesFor = (styles: Record<string, UserStyle>) =>
  Object.fromEntries(
    ENTRIES.flatMap((entry) => {
      const style = styles[entry.id];
      return entry.hoverGroups.map((id): [string, GroupStyle] => [
        id,
        {
          color: style?.color,
          widthScale: widthScale(style),
          display:
            style?.show ??
            Boolean(HOVER_GROUPS.find((group) => group.id === id)?.display),
        },
      ]);
    }),
  );
