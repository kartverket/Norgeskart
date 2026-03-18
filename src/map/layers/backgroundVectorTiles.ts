export type VectorTileLayerName = 'nautical-background';

export const isVectorTileLayer = (
  layerName: string,
): layerName is VectorTileLayerName => {
  return layerName === 'nautical-background';
};
