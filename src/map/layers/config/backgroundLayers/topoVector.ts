import { resolveTopoVectorStyle } from './topoVectorStyle';
import { VectorTileBackgroundLayer } from './types';

export const topoVectorBackgroundLayers: VectorTileBackgroundLayer[] = [
  {
    type: 'VectorTile',
    layerName: 'topo-vector',
    requiredProjection: 'EPSG:25833',
    styleUrl: window.location.origin + '/styles/topo-vector.json',
    resolveStyle: resolveTopoVectorStyle,
  },
];
