import { getDefaultStore } from 'jotai';
import { Feature } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import { mapAtom } from '../atoms';

export const addGeolocationLayer = () => {
  removeGeolocationLayer();
  const store = getDefaultStore();
  const map = store.get(mapAtom);

  const pointFeature = new Feature({
    geometry: new Point([0, 0]),
  });
  pointFeature.setStyle(
    new Style({
      image: new Circle({
        radius: 8,
        fill: new Fill({ color: '#245cf7' }),
        stroke: new Stroke({ color: 'white', width: 2 }),
      }),
    }),
  );
  const positionLayer = new VectorLayer({
    source: new VectorSource({
      features: [pointFeature],
    }),
    properties: { id: 'positionLayer' },
  });
  map.addLayer(positionLayer);
};

const getGeolocationLayer = (): VectorLayer | undefined => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const positionLayer = map
    .getLayers()
    .getArray()
    .find((layer) => layer.get('id') === 'positionLayer') as VectorLayer;
  return positionLayer;
};

export const removeGeolocationLayer = () => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const positionLayer = getGeolocationLayer();
  if (positionLayer) {
    map.removeLayer(positionLayer);
  }
};

export const updatePositionFeature = (coordinate: Coordinate) => {
  const positionLayer = getGeolocationLayer();
  if (positionLayer) {
    const source = positionLayer.getSource();
    if (source) {
      const feature = source.getFeatures()[0];
      if (feature) {
        feature.setGeometry(new Point(coordinate));
      }
    }
  }
};
