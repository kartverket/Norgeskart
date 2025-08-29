import { useEffect } from 'react';
import { useDrawActions } from '../../settings/draw/drawActions/drawActionsHooks';
import { useDrawSettings } from '../drawHooks';

export const useDrawControlsKeyboardEffects = () => {
  const { drawEnabled, abortDrawing, deleteSelected } = useDrawSettings();
  const { undoLast, redoLastUndone } = useDrawActions();

  useEffect(() => {
    const keyListener = (event: KeyboardEvent) => {
      if (!drawEnabled) {
        return;
      }

      if (event.key === 'Escape') {
        abortDrawing();
      }
    };
    document.addEventListener('keydown', keyListener);
    return () => {
      document.removeEventListener('keydown', keyListener);
    };
  }, [abortDrawing, drawEnabled]);

  useEffect(() => {
    const keyListener = (event: KeyboardEvent) => {
      if (!drawEnabled) {
        return;
      }
      if (event.key === 'Delete') {
        deleteSelected();
      }
    };
    document.addEventListener('keydown', keyListener);
    return () => {
      document.removeEventListener('keydown', keyListener);
    };
  }, [deleteSelected, drawEnabled]);

  useEffect(() => {
    const undoListener = (event: KeyboardEvent) => {
      if (!drawEnabled) {
        return;
      }

      if (
        event.key.toLocaleLowerCase() === 'z' &&
        (event.ctrlKey || event.metaKey)
      ) {
        if (event.shiftKey) {
          redoLastUndone();
        } else {
          undoLast();
        }

        event.preventDefault();
      }
    };
    document.addEventListener('keydown', undoListener);
    return () => {
      document.removeEventListener('keydown', undoListener);
    };
  }, [undoLast, redoLastUndone, drawEnabled]);
};
