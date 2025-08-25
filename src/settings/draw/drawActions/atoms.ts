import { atom } from 'jotai';

export type DrawActionType = 'CREATE' | 'UPDATE' | 'DELETE';
export type DrawAction = {
  type: DrawActionType;
  featureId: string;
  details: any;
};

export const drawActionsAtom = atom<DrawAction[]>([]);
export const actionOffsetAtom = atom<number>(0);
export const canUndoAtom = atom((get) => {
  const actions = get(drawActionsAtom);
  return actions.length > 0 && get(actionOffsetAtom) < actions.length;
});

export const canRedoAtom = atom((get) => {
  return get(actionOffsetAtom) > 0;
});
