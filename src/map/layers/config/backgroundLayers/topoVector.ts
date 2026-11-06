import { getEnv } from '../../../../env';
import { enableTopoVectorHover } from './topoVectorHover';
import { resolveTopoVectorStyle } from './topoVectorStyle';
import { VectorTileBackgroundLayer } from './types';

export const topoVectorBackgroundLayers: VectorTileBackgroundLayer[] = [
  {
    type: 'VectorTile',
    layerName: 'topo-vector',
    requiredProjection: 'EPSG:25833',
    styleUrl: `${getEnv().layerProviderParameters.topoVectorMartin.styleBaseUrl}/style.json`,
    resolveStyle: resolveTopoVectorStyle,
    onLayerCreated: enableTopoVectorHover,
  },
];
