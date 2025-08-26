import { atom } from 'jotai';

export type DrawActionType =
  | 'CREATE'
  | 'EDIT_GEOMETRY'
  | 'DELETE'
  | 'EDIT_STYLE';
export type DrawAction = DrawActionBase &
  (CreateFeatureData | EditGeometryData | DeleteFeatureDetails | EditStyleData);

type CreateFeatureData = { type: 'CREATE' };
type EditStyleData = {
  type: 'EDIT_STYLE';
  details: {
    oldStroke: string;
    newStroke: string;
  };
};

type EditGeometryData = {
  type: 'EDIT_GEOMETRY';
  details: {
    oldCoordinates: number[];
    newCoordinates: number[];
  };
};

type DeleteFeatureDetails = {
  type: 'DELETE';
  details: {
    coordinates: number[];
    fill: string;
  };
};

type DrawActionBase = {
  featureId: string;
};

export const drawActionsAtom = atom<DrawAction[]>([]);
export const actionOffsetAtom = atom<number>(0);
export const canUndoAtom = atom((get) => {
  const actions = get(drawActionsAtom);
  return actions.length > 0 && get(actionOffsetAtom) <= actions.length - 1;
});

export const canRedoAtom = atom((get) => {
  return get(actionOffsetAtom) > 0;
});
