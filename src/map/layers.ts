import BaseLayer from 'ol/layer/Base';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { ProjectionIdentifier } from './atoms';

type LayerFunction =
  | ((_: ProjectionIdentifier) => BaseLayer)
  | (() => BaseLayer);

export const isMapLayerBackground = (layer: BaseLayer) => {
  return layer.get('id')?.startsWith('bg.');
};

export type MapLayer = {
  getLayer: LayerFunction;
  id: string;
  maxZoom?: number;
};

export type MapLayers = {
  drawLayer: MapLayer;
  markerLayer: MapLayer;
};

const mapLayers: MapLayers = {
  drawLayer: {
    id: 'drawLayer',
    getLayer: () => {
      return new VectorLayer({
        zIndex: 2,
        source: new VectorSource({ wrapX: false }),
        properties: { id: 'drawLayer' },
      });
    },
  },

  markerLayer: {
    id: 'markerLayer',
    getLayer: () => {
      return new VectorLayer({
        zIndex: 3,
        source: new VectorSource({ wrapX: false }),
        properties: { id: 'markerLayer' },
      });
    },
  },
};

export { mapLayers };
