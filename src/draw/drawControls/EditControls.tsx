import { HStack, IconButton } from '@kvib/react';
import { useEffect } from 'react';
import { DrawAction } from '../../settings/draw/drawActions/atoms';
import { useDrawActionsState } from '../../settings/draw/drawActions/drawActionsHooks';
import { useDrawSettings } from './hooks/drawSettings';
import { useVerticalMove } from './hooks/verticalMove';

export const EditControls = () => {
  const { moveSelectedUp, moveSelectedDown } = useVerticalMove();
  const { drawType } = useDrawSettings();
  const { addDrawAction } = useDrawActionsState();

  const listener = (e: Event) => {
    if (e instanceof CustomEvent) {
      const action: DrawAction = {
        type: 'MOVE',
        details: {
          featuresMoved: e.detail,
        },
      };
      addDrawAction(action);
    }
  };
  useEffect(() => {
    document.addEventListener('featureMoved', listener);
    return () => document.removeEventListener('featureMoved', listener);
  });

  if (drawType !== 'Move') {
    return null;
  }
  return (
    <HStack>
      <IconButton
        onClick={() => {
          moveSelectedUp();
        }}
        icon={'move_up'}
        variant="ghost"
      />
      <IconButton
        onClick={() => {
          moveSelectedDown();
        }}
        icon={'move_down'}
        variant="ghost"
      />
    </HStack>
  );
};
