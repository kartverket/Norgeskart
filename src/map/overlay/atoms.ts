import { atom } from 'jotai';
import { MapTool } from './MapOverlay';

export const mapToolAtom = atom<MapTool>(null);

export const showSearchComponentAtom = atom<boolean>((get) => {
  const currentMapTool = get(mapToolAtom);
  return currentMapTool === null;
});