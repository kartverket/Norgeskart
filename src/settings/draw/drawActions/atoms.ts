import { atom } from 'jotai';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';

export type DrawActionType =
  | 'CREATE'
  | 'EDIT_GEOMETRY'
  | 'MOVE'
  | 'DELETE'
  | 'EDIT_STYLE';

export type DrawAction =
  | CreateFeatureData
  | EditGeometryData
  | DeleteFeaturesDetails
  | MoveFeatureData
  | EditStyleData;

type CreateFeatureData = {
  featureId: string;
  type: 'CREATE';
  details: {
    feature: Feature;
  };
};
type EditStyleData = {
  featureId: string;
  type: 'EDIT_STYLE';
  details: {
    oldStroke: string;
    newStroke: string;
  };
};

type MoveFeatureData = {
  type: 'MOVE';
  details: {
    featuresMoved: {
      featureId: string;
      oldGeometry: Geometry;
      newCoordinates: Geometry;
    }[];
  };
};

type EditGeometryData = {
  featureId: string;
  type: 'EDIT_GEOMETRY';
  details: {
    oldCoordinates: number[];
    newCoordinates: number[];
  };
};

type DeleteFeaturesDetails = {
  type: 'DELETE';
  details: {
    features: Feature[];
  };
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
