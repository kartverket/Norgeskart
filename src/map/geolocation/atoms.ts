import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { transform } from 'ol/proj';
import { mapAtom } from '../atoms';
import {
  addGeolocationLayer,
  removeGeolocationLayer,
  updatePositionFeature,
} from './utils';

export const trackPositionAtom = atom<boolean>(false);
const watchIdAtom = atom<number | null>(null);
const hasMovedToCurrentLocationAtom = atom<boolean>(false);

export const trackPostitionAtomEffect = atomEffect((get) => {
  const trackPosition = get(trackPositionAtom);
  const store = getDefaultStore();
  const map = store.get(mapAtom);

  if (!navigator.geolocation) {
    console.warn('Geolocation is not supported by this browser');
    return;
  }
  if (trackPosition) {
    addGeolocationLayer();

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        const transformedCoords = transform(
          [longitude, latitude],
          'EPSG:4326',
          map.getView().getProjection(),
        );
        if (!store.get(hasMovedToCurrentLocationAtom)) {
          map.getView().setCenter(transformedCoords);
          map.getView().setZoom(15);
          store.set(hasMovedToCurrentLocationAtom, true);
        }

        updatePositionFeature(transformedCoords);
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
    store.set(hasMovedToCurrentLocationAtom, false);
    removeGeolocationLayer();
  }
  return () => {
    const watchId = store.get(watchIdAtom);
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      store.set(watchIdAtom, null);
    }
    store.set(hasMovedToCurrentLocationAtom, false);
    removeGeolocationLayer();
  };
});
