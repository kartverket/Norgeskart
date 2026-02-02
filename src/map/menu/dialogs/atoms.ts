import { atom } from 'jotai';
import { Coordinate } from 'ol/coordinate';

export const isRettIKartetDialogOpenAtom = atom<boolean>(false);
export const rettIKartetCoordinatesAtom = atom<Coordinate | null>(null);
