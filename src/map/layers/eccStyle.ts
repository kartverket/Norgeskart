import { atom } from 'jotai';
import { getUrlParameter } from '../../shared/utils/urlUtils';

export const ECC_STYLES = [
  { id: 'style-id-245', title: 'Full' },
  { id: 'style-id-260', title: 'Full ECDIS' },
  { id: 'style-id-2156', title: 'Full ECDIS without SCAMIN' },
  { id: 'style-id-263', title: 'Full transparent land' },
  { id: 'style-id-2142', title: 'Full transparent land ECDIS' },
  { id: 'style-id-200', title: 'Default' },
  { id: 'style-id-2141', title: 'NHST' },
  { id: 'style-id-201', title: 'Transparent land' },
  { id: 'style-id-3135', title: 'S-100 Explorer ENC overlay' },
  { id: 'style-id-2475', title: 'Standard transparent land w/o lights' },
  { id: 'style-id-246', title: 'Standard' },
  { id: 'style-id-262', title: 'Standard transparent land' },
  { id: 'style-id-2195', title: 'Base with M_QUAL' },
  { id: 'style-id-244', title: 'Base' },
  { id: 'style-id-261', title: 'Base transparent land' },
] as const;

export type EccStyleId = (typeof ECC_STYLES)[number]['id'];

// Empty string means no explicit STYLES param — server picks default
export const eccStyleAtom = atom<string>(getUrlParameter('eccStyle') ?? '');
