import type MapLibreLayer from '@geoblocks/ol-maplibre-layer/lib/MapLibreLayer';
import { ProjectionIdentifier } from '../../../projections/types';
import {
  BackgroundLayerName,
  EmptyLayerName,
  VectorTileLayerName,
  WMSLayerName,
  WMTSLayerName,
} from '../../backgroundLayers';
import { MapLibreStyleObject } from './topoVectorStyle';

export type LayerType = 'WMTS' | 'WMS' | 'VectorTile' | 'Empty';

export type LayerProvider = {
  capabilitiesUrl: string;
};

type BackgroundLayerBase = {
  layerName: BackgroundLayerName;
  requiredProjection?: ProjectionIdentifier;
  showForProjections?: ProjectionIdentifier[];
  moveToExtent?: [number, number, number, number];
};

export type WMTSBackgroundLayer = BackgroundLayerBase & {
  type: 'WMTS';
  layerName: WMTSLayerName;
  wmtsLayerName?: string;
  provider: LayerProvider;
  legendUrl?: string;
  // 512 px twin of the layer; `matrixSets` maps each 1x matrix set to its 2x grid with the
  // same tile ids. Used with tilePixelRatio 2 on devicePixelRatio > 1 screens.
  hidpi?: { wmtsLayerName: string; matrixSets: Record<string, string> };
};

export type VectorTileBackgroundLayer = BackgroundLayerBase & {
  type: 'VectorTile';
  layerName: VectorTileLayerName;
  styleUrl: string;
  // When set, the MapLibre style is built at load time (fetch + reconcile
  // against the tile server) instead of handing MapLibre the styleUrl directly.
  resolveStyle?: () => Promise<MapLibreStyleObject>;
  onLayerCreated?: (layer: MapLibreLayer) => void;
};

export type WMSBackgroundLayer = BackgroundLayerBase & {
  type: 'WMS';
  layerName: WMSLayerName;
  url: string;
  props?: Record<string, string | number | boolean>;
};

export type EmptyBackgroundLayer = BackgroundLayerBase & {
  type: 'Empty';
  layerName: EmptyLayerName;
};

export type BackgroundLayer =
  | WMTSBackgroundLayer
  | VectorTileBackgroundLayer
  | WMSBackgroundLayer
  | EmptyBackgroundLayer;
