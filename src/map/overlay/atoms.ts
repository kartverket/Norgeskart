import { atom } from 'jotai';
import { MapTool } from '../../Layout';

export const mapToolAtom = atom<MapTool>(null);
export const showSearchComponentAtom = atom<boolean>((get) => {
  const currentMapTool = get(mapToolAtom);
  return currentMapTool === null;
});

export const drawPanelCollapsedAtom = atom(false);
