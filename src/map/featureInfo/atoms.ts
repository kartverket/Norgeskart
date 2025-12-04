import { atom } from 'jotai';
import type { FeatureInfoResult } from './types';

export const featureInfoResultAtom = atom<FeatureInfoResult | null>(null);

export const featureInfoLoadingAtom = atom<boolean>(false);

export const featureInfoPanelOpenAtom = atom<boolean>(false);
