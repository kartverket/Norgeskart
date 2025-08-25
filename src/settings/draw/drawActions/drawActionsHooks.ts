import { useAtom, useAtomValue } from 'jotai';
import {
  actionOffsetAtom,
  canRedoAtom,
  canUndoAtom,
  DrawAction,
  drawActionsAtom,
} from './atoms';

export const useDrawActions = () => {
  const [drawActions, setDrawActions] = useAtom(drawActionsAtom);
  const [actionOffset, setActionOffset] = useAtom(actionOffsetAtom);
  const canUndo = useAtomValue(canUndoAtom);
  const canRedo = useAtomValue(canRedoAtom);

  const incrementOffset = () => {
    const maxPossibleOffset = drawActions.length;
    if (actionOffset + 1 < maxPossibleOffset) {
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
    resetOffset();
    setDrawActions((prev) => [...prev, action]);
  };

  const undoLast = () => {
    incrementOffset();
  };

  const redoLastUndone = () => {
    decrementOffset();
  };

  return {
    canUndo,
    canRedo,
    addDrawAction,
    undoLast,
    redoLastUndone,
  };
};
