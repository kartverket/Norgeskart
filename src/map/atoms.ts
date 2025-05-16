import { atom } from 'jotai';
import { MapLayers } from './layers';




export type ProjectionIdentifier =
  | 'EPSG:3857' // webmercator
  //'EPSG:25832'| // utm32n
  | 'EPSG:25833' // utm33n
  | 'EPSG:25835'; // utm35n

export const projectionAtom = atom<ProjectionIdentifier>('EPSG:3857');
export const backgroundLayerAtom = atom<keyof MapLayers["backgroundLayers"] >('newTopo');
