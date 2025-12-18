// Root SLD element
export interface StyledLayerDescriptor {
  Version: string; // e.g., "1.0.0" or "1.1.0"
  Name?: string;
  NamedLayer: NamedLayer[] | NamedLayer;
}

// Named layer
export interface NamedLayer {
  Name: string;
  UserStyle: UserStyle[] | UserStyle;
}

// User-defined style
export interface UserStyle {
  Name: string;
  Title?: string;
  Abstract?: string;
  IsDefault?: boolean;
  FeatureTypeStyle: FeatureTypeStyle[] | FeatureTypeStyle;
}

// Feature type style
export interface FeatureTypeStyle {
  Rule: Rule[] | Rule;
}

// Styling rule
export interface Rule {
  Name?: string;
  Title?: string;
  Filter?: FilterExpression;
  MinScaleDenominator?: number;
  MaxScaleDenominator?: number;
  PointSymbolizer?: PointSymbolizer;
  LineSymbolizer?: LineSymbolizer;
  PolygonSymbolizer?: PolygonSymbolizer | PolygonSymbolizer[];
  TextSymbolizer?: TextSymbolizer;
}

// Symbolizer union
export type Symbolizer =
  | PointSymbolizer
  | LineSymbolizer
  | PolygonSymbolizer
  | TextSymbolizer;

// Specific symbolizers
export interface PointSymbolizer {
  Type: 'Point';
  Graphic: Graphic;
}

export interface LineSymbolizer {
  Type: 'Line';
  Stroke: Stroke;
}

export type PolygonSymbolizer = {
  Type: 'Polygon';
  Fill?: Fill;
  Stroke?: Stroke;
};

export interface TextSymbolizer {
  Type: 'Text';
  Label: string;
  Font?: Font;
  Fill?: Fill;
  Halo?: Halo;
}

export interface Mark {
  WellKnownName: string;
  Fill?: Fill;
  Stroke?: Stroke;
}

// Supporting types
export interface Graphic {
  Mark?: Mark;
  ExternalGraphic?: ExternalGraphic;
  Size?: number;
}

export interface ExternalGraphic {
  Href: string;
  Format: string; // e.g., "image/png"
}

export interface Stroke {
  CssParameter?: CssParameter;
  SvgParameter?: SvgParameter;
}

export interface Fill {
  CssParameter?: CssParameter;
  SvgParameter?: SvgParameter;
}

export interface Halo {
  Fill: { SvgParameter: string };
  Radius: number;
}

export type CssParameter = string | string[];
export type SvgParameter = string | string[];

export interface Font {
  Family: string;
  Size: number;
  Style?: string;
  Weight?: string;
}

export type FilterExpression = string; // Could be extended for OGC filters
