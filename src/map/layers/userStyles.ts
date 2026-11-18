import { atomWithStorage } from 'jotai/utils';

// A user's own look for a Kartdetalj: colour, line width and (for vector data)
// whether it's drawn at all. Kept per browser; unset fields mean the default.
export type LineWidth = 'thin' | 'normal' | 'thick';

export type UserStyle = {
  // undefined = the layer's own colours (e.g. matrikkel boundaries by accuracy).
  color?: string;
  width?: LineWidth;
  // Vector data only: draw it on the map, not just on hover.
  show?: boolean;
};

export const WIDTH_SCALE: Record<LineWidth, number> = {
  thin: 0.6,
  normal: 1,
  thick: 1.8,
};

// Readable on both the topo map and aerial photos. key names the colour for
// screen readers (map.settings.layers.style.colors.<key>).
export const STYLE_COLORS = [
  { key: 'black', value: '#000000' },
  { key: 'white', value: '#ffffff' },
  { key: 'red', value: '#c62828' },
  { key: 'orange', value: '#ff6d00' },
  { key: 'yellow', value: '#ffd600' },
  { key: 'green', value: '#2e7d32' },
  { key: 'blue', value: '#1565c0' },
  { key: 'purple', value: '#6a1b9a' },
];

export const widthScale = (style?: UserStyle) =>
  WIDTH_SCALE[style?.width ?? 'normal'];

export const userStylesAtom = atomWithStorage<Record<string, UserStyle>>(
  'kartdetaljer-styles',
  {},
  undefined,
  { getOnInit: true },
);
