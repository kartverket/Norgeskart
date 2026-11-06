import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { MapTool } from '../../Layout';

export const mapToolAtom = atom<MapTool>(null);

// The user's choice, kept between visits. On by default so people find the feature.
export const hoverEnabledAtom = atomWithStorage('map-hover-enabled', true);
// False until the overlay loads, e.g. always off the internal network: no dead button.
export const hoverAvailableAtom = atom(false);
export const showSearchComponentAtom = atom<boolean>((get) => {
  const currentMapTool = get(mapToolAtom);
  return currentMapTool === null;
});

export const drawPanelCollapsedAtom = atom(false);
