// Tekstblokk
export interface TextBlock {
  type: 'text';
  text: string;
}

// Punktliste
export interface ListBlock {
  type: 'list';
  items: string[];
}

// (valgfritt) lenkeblokk
export interface LinkBlock {
  type: 'link';
  text: string;
  href: string;
}

// Kombinasjon av alle innholdstyper
export type ContentBlock = TextBlock | ListBlock | LinkBlock;

// Ett tips i tips-lista
export interface Tip {
  title: string;
  content: ContentBlock[];
}

// Typen som ESM-import av JSON returnerer
export type TipsJsonModule = { default: Tip[] };

// Liten hjelpefunksjon som håndterer m vs. m.default
export function unwrapJsonModule<T>(mod: unknown): T {
  if (mod && typeof mod === 'object' && 'default' in mod) {
    return (mod as { default: T }).default;
  }
  return mod as T;
}
