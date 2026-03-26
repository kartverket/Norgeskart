import { atom } from 'jotai';
import { getUrlParameter } from '../shared/utils/urlUtils';
const getDefaultDialogState = (): boolean => {
  const printOpenParam = getUrlParameter('printTool');
  return printOpenParam != null;
};

export const isPrintDialogOpenAtom = atom<boolean>(getDefaultDialogState());
