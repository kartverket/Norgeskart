import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';
import Layer from 'ol/layer/Layer';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

type LayerFunction = () => BaseLayer;

export const isMapLayerBackground = (layer: BaseLayer): boolean => {
  return layer.get('id')?.startsWith('bg.') === true;
};

// LayerGroup (main grid + NP cap): its first layer's projection.
export const backgroundLayerProjection = (
  layer: BaseLayer,
): string | undefined => {
  if (layer instanceof LayerGroup) {
    const first = layer.getLayers().item(0);
    return first ? backgroundLayerProjection(first) : undefined;
  }
  if (layer instanceof Layer) {
    return layer.getSource()?.getProjection()?.getCode();
  }
  return undefined;
};

export type MapLayer = {
  getLayer: LayerFunction;
  maxZoom?: number;
};

export type MapLayers = {
  drawLayer: MapLayer;
  drawOverlayLayer: MapLayer;
  markerLayer: MapLayer;
  posterMarkerLayer: MapLayer;
  clusterLayer: MapLayer;
  propertyGeometryLayer: MapLayer;
  measureLayer: MapLayer;
};

const mapLayers: MapLayers = {
  drawLayer: {
    getLayer: () => {
      return new VectorLayer({
        zIndex: 2,
        source: new VectorSource({ wrapX: false }),
        properties: { id: 'drawLayer' },
      });
    },
  },
  drawOverlayLayer: {
    getLayer: () => {
      return new VectorLayer({
        zIndex: 3,
        source: new VectorSource({ wrapX: false }),
        properties: { id: 'drawOverlayLayer' },
      });
    },
  },
  markerLayer: {
    getLayer: () => {
      return new VectorLayer({
        zIndex: 6,
        source: new VectorSource({ wrapX: false }),
        properties: { id: 'markerLayer' },
      });
    },
  },
  posterMarkerLayer: {
    getLayer: () => {
      return new VectorLayer({
        zIndex: 6,
        source: new VectorSource({ wrapX: false }),
        properties: { id: 'posterMarkerLayer' },
      });
    },
  },

  clusterLayer: {
    getLayer: () => {
      return new VectorLayer({
        zIndex: 4,
        source: new VectorSource({ wrapX: false }),
        properties: { id: 'clusterLayer' },
      });
    },
  },
  propertyGeometryLayer: {
    getLayer: () => {
      return new VectorLayer({
        zIndex: 5,
        source: new VectorSource({ wrapX: false }),
        properties: { id: 'propertyGeometryLayer' },
      });
    },
  },
  measureLayer: {
    getLayer: () => {
      return new VectorLayer({
        zIndex: 3,
        source: new VectorSource({ wrapX: false }),
        properties: { id: 'measureLayer' },
      });
    },
  },
};

export { mapLayers };
