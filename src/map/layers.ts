import BaseLayer from 'ol/layer/Base';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

type LayerFunction = () => BaseLayer;

export const isMapLayerBackground = (layer: BaseLayer): boolean => {
  return layer.get('id')?.startsWith('bg.') === true;
};

export type MapLayer = {
  getLayer: LayerFunction;
  id: string;
  maxZoom?: number;
};

export type MapLayers = {
  drawLayer: MapLayer;
  markerLayer: MapLayer;
  clusterLayer: MapLayer;
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

  clusterLayer: {
    id: 'clusterLayer',
    getLayer: () => {
      return new VectorLayer({
        zIndex: 4,
        source: new VectorSource({ wrapX: false }),
        properties: { id: 'clusterLayer' },
      });
    },
  },
};

export { mapLayers };
