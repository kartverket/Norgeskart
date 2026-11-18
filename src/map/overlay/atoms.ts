import { atom } from 'jotai';
import { MapTool } from '../../Layout';

export const mapToolAtom = atom<MapTool>(null);

// False until the overlay loads, e.g. always off the internal network (our vector
// tiles are internal-only): the Kartdetaljer that need it stay hidden.
export const hoverAvailableAtom = atom(false);
// Hover group id → whether the current zoom shows it, for the bottom-bar chip.
export const hoverStatusAtom = atom<Record<string, boolean>>({});
export const showSearchComponentAtom = atom<boolean>((get) => {
  const currentMapTool = get(mapToolAtom);
  return currentMapTool === null;
});

export const drawPanelCollapsedAtom = atom(false);
