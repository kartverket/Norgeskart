import { ButtonGroup, IconButton } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { canRedoAtom, canUndoAtom } from '../settings/draw/drawActions/atoms';
import { useDrawActions } from '../settings/draw/drawActions/drawActionsHooks';

export const UndoRedoControls = ({ heading }: { heading?: string }) => {
  const { undoLast, redoLastUndone } = useDrawActions();
  const canUndoDrawAction = useAtomValue(canUndoAtom);
  const canRedoDrawAction = useAtomValue(canRedoAtom);

  return (
    <>
      <ButtonGroup>
        <IconButton
          variant="ghost"
          disabled={!canUndoDrawAction}
          onClick={undoLast}
          icon={'undo'}
        />
        {canRedoDrawAction && (
          <IconButton
            variant="ghost"
            disabled={!canRedoDrawAction}
            onClick={redoLastUndone}
            icon={'redo'}
          />
        )}
      </ButtonGroup>
    </>
  );
};
