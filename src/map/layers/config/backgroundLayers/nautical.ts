import { BackgroundLayer } from './types';

export const nauticalBackgroundLayers: BackgroundLayer[] = [
  {
    type: 'VectorTile',
    layerName: 'nautical-background',
    requiredProjection: 'EPSG:3857',
    styleUrl: window.location.origin + '/api/styles/nautisk-bakgrunnskart.json',
  },
];
