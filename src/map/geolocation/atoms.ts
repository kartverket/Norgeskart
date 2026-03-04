import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import { mapAtom } from '../atoms';
import { addGeolocationLayer, removeGeolocationLayer } from './utils';

export const trackPositionAtom = atom<boolean>(false);
const watchIdAtom = atom<number | null>(null);

export const trackPostitionAtomEffect = atomEffect((get) => {
  const trackPosition = get(trackPositionAtom);
  const store = getDefaultStore();
  const map = store.get(mapAtom);

  if (!navigator.geolocation) return;
  if (trackPosition) {
    addGeolocationLayer();

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        console.log('Got position', pos);
        const { longitude, latitude } = pos.coords;
        const transformedCoords = transform(
          [longitude, latitude],
          'EPSG:4326',
          map.getView().getProjection(),
        );
        const positionLayer = map
          .getLayers()
          .getArray()
          .find((layer) => layer.get('id') === 'positionLayer') as VectorLayer;
        if (positionLayer) {
          const source = positionLayer.getSource();
          if (source) {
            const feature = source.getFeatures()[0];
            if (feature) {
              feature.setGeometry(new Point(transformedCoords));
            }
          }
        }
      },
      (err) => {
        console.error('Error getting position', err);
      },
      { enableHighAccuracy: true },
    );
    store.set(watchIdAtom, watchId);
  } else {
    const watchId = store.get(watchIdAtom);
    if (watchId != null) {
      navigator.geolocation.clearWatch(watchId);
      store.set(watchIdAtom, null);
    }
    removeGeolocationLayer();
  }
  return () => {
    const watchId = store.get(watchIdAtom);
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      store.set(watchIdAtom, null);
    }
    removeGeolocationLayer();
  };
});
