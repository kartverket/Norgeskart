import { atom } from 'jotai';

export const isPrintDialogOpenAtom = atom<boolean>(false);

export const printFormatAtom = atom<'A4' | 'A3'>('A4');
export const printOrientationAtom = atom<'portrait' | 'landscape'>('portrait');
