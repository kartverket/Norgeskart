import { atom } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { LineString } from 'ol/geom';

export const profileLineAtom = atom<LineString | null>(null);

export const profileEffect = atomEffect((get) => {
  const line = get(profileLineAtom);
  console.log('Profile line changed:', line);
});
