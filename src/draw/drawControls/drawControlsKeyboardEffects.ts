import { useEffect } from 'react';
import { useDrawActions } from '../../settings/draw/drawActions/drawActionsHooks';
import { removeFeaturelessInteractiveMeasurementOverlay } from './drawUtils';
import { useDrawSettings } from './hooks/drawSettings';

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
        removeFeaturelessInteractiveMeasurementOverlay();
      }
    };
    document.addEventListener('keydown', keyListener);
    return () => {
      document.removeEventListener('keydown', keyListener);
    };
  }, [
    abortDrawing,
    drawEnabled,
    removeFeaturelessInteractiveMeasurementOverlay,
  ]);

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
