import { HStack, IconButton } from '@kvib/react';
import { useEffect } from 'react';
import { DrawAction } from '../../settings/draw/drawActions/atoms';
import { useDrawActionsState } from '../../settings/draw/drawActions/drawActionsHooks';
import { StyleChangeDetail } from './hooks/drawEventHandlers';
import { useDrawSettings } from './hooks/drawSettings';
import { useVerticalMove } from './hooks/verticalMove';

export const EditControls = () => {
  const { moveSelectedUp, moveSelectedDown } = useVerticalMove();
  const { drawType } = useDrawSettings();
  const { addDrawAction } = useDrawActionsState();

  const featureMovedListener = (e: Event) => {
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

  const featureStyleChangedListener = (e: Event) => {
    if (e instanceof CustomEvent) {
      const action: DrawAction = {
        type: 'EDIT_STYLE',
        details: e.detail as StyleChangeDetail[],
      };
      addDrawAction(action);
    }
  };
  useEffect(() => {
    document.addEventListener('featureMoved', featureMovedListener);
    return () =>
      document.removeEventListener('featureMoved', featureMovedListener);
  });
  useEffect(() => {
    document.addEventListener(
      'featureStyleChanged',
      featureStyleChangedListener,
    );
    return () =>
      document.removeEventListener(
        'featureStyleChanged',
        featureStyleChangedListener,
      );
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
