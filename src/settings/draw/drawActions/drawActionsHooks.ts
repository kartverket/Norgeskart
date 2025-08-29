import { getDefaultStore, useAtom, useAtomValue } from 'jotai';
import { useDrawSettings } from '../../../draw/drawHooks';
import {
  actionOffsetAtom,
  canRedoAtom,
  canUndoAtom,
  DrawAction,
  drawActionsAtom,
} from './atoms';

export const useDrawActions = () => {
  const actionOffset = useAtomValue(actionOffsetAtom);
  const drawActions = useAtomValue(drawActionsAtom);
  const canUndo = useAtomValue(canUndoAtom);
  const canRedo = useAtomValue(canRedoAtom);
  const { removeDrawnFeatureById, addFeature } = useDrawSettings();
  const { decrementOffset, incrementOffset } = useDrawActionsState();
  const undoLast = () => {
    if (!canUndo) {
      console.warn('Cannot undo');
      return;
    }
    const actionIndex = drawActions.length - actionOffset - 1;
    const actionToUndo = drawActions[actionIndex];

    if (actionToUndo == null) {
      console.warn('No action to undo');
      return;
    }

    switch (actionToUndo.type) {
      case 'CREATE':
        removeDrawnFeatureById(actionToUndo.featureId);
        // Handle create action undo
        break;
      case 'EDIT_STYLE':
        // Handle update action undo
        break;
      case 'EDIT_GEOMETRY':
        // Handle update action undo
        break;
      case 'DELETE':
        // Handle delete action undo
        break;
    }

    incrementOffset();
  };

  const redoLastUndone = () => {
    if (!canRedo) {
      console.warn('Cannot redo');
    }
    const actionIndex = drawActions.length - actionOffset;
    const actionToRedo = drawActions[actionIndex];

    if (actionToRedo == null) {
      console.warn('No action to redo');
      return;
    }
    console.log('Redoing action', actionToRedo);

    switch (actionToRedo.type) {
      case 'CREATE':
        addFeature(actionToRedo.details.feature);
        break;
      case 'EDIT_STYLE':
        // Handle update action redo
        break;
      case 'EDIT_GEOMETRY':
        // Handle update action redo
        break;
      case 'DELETE':
        // Handle delete action redo
        break;
    }

    decrementOffset();
  };

  return {
    undoLast,
    redoLastUndone,
  };
};

export const useDrawActionsState = () => {
  const [drawActions, setDrawActions] = useAtom(drawActionsAtom);
  const [actionOffset, setActionOffset] = useAtom(actionOffsetAtom);

  const incrementOffset = () => {
    const maxPossibleOffset = drawActions.length;
    if (actionOffset < maxPossibleOffset) {
      setActionOffset((prev) => prev + 1);
    }
  };

  const decrementOffset = () => {
    if (actionOffset > 0) {
      setActionOffset((prev) => prev - 1);
    }
  };

  const resetOffset = () => {
    setActionOffset(0);
  };

  const addDrawAction = (action: DrawAction) => {
    const store = getDefaultStore();
    const currentOffset = store.get(actionOffsetAtom);
    const previousActions = store.get(drawActionsAtom);
    const offsetActionList = previousActions.slice(
      0,
      previousActions.length - currentOffset,
    );
    setDrawActions([...offsetActionList, action]);
    resetOffset();
  };

  return {
    decrementOffset,
    incrementOffset,
    resetOffset,
    addDrawAction,
  };
};
