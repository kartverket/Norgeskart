import { ButtonGroup, HStack, IconButton, Switch, Tooltip } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { snapEnabledAtom } from '../../settings/draw/atoms';
import {
  canRedoAtom,
  canUndoAtom,
  DrawAction,
} from '../../settings/draw/drawActions/atoms';
import {
  useDrawActions,
  useDrawActionsState,
} from '../../settings/draw/drawActions/drawActionsHooks';
import { StyleChangeDetail } from './hooks/drawEventHandlers';
import { useDrawSettings } from './hooks/drawSettings';
import { useVerticalMove } from './hooks/verticalMove';

export const EditControls = () => {
  const { moveSelectedUp, moveSelectedDown } = useVerticalMove();
  const { drawType, deleteSelected } = useDrawSettings();
  const { addDrawAction } = useDrawActionsState();
  const { undoLast, redoLastUndone } = useDrawActions();
  const canUndoDrawAction = useAtomValue(canUndoAtom);
  const canRedoDrawAction = useAtomValue(canRedoAtom);
  const [snapEnabled, setSnapEnabled] = useAtom(snapEnabledAtom);
  const { t } = useTranslation();

  const featureMovedListener = useCallback(
    (e: Event) => {
      if (e instanceof CustomEvent) {
        const action: DrawAction = {
          type: 'MOVE',
          details: {
            featuresMoved: e.detail,
          },
        };
        addDrawAction(action);
      }
    },
    [addDrawAction],
  );

  const featureStyleChangedListener = useCallback(
    (e: Event) => {
      if (e instanceof CustomEvent) {
        const action: DrawAction = {
          type: 'EDIT_STYLE',
          details: e.detail as StyleChangeDetail[],
        };
        addDrawAction(action);
      }
    },
    [addDrawAction],
  );

  useEffect(() => {
    document.addEventListener('featureMoved', featureMovedListener);
    return () =>
      document.removeEventListener('featureMoved', featureMovedListener);
  }, [featureMovedListener]);

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
  }, [featureStyleChangedListener]);

  return (
    <>
      <HStack marginTop={2} wrap="wrap">
        {drawType === 'Move' && (
          <ButtonGroup>
            <Tooltip content={t('draw.controls.tool.tooltip.movedown')}>
              <IconButton
                onClick={moveSelectedUp}
                icon="arrow_cool_down"
                variant="plain"
                size={{ base: 'xs', md: 'sm' }}
              />
            </Tooltip>

            <Tooltip content={t('draw.controls.tool.tooltip.moveup')}>
              <IconButton
                onClick={moveSelectedDown}
                icon="arrow_warm_up"
                variant="ghost"
                size={{ base: 'xs', md: 'sm' }}
              />
            </Tooltip>
          </ButtonGroup>
        )}
        <ButtonGroup>
          <Tooltip content={t('draw.controls.tool.tooltip.undo')}>
            <IconButton
              variant="ghost"
              disabled={!canUndoDrawAction}
              onClick={undoLast}
              icon="undo"
              size={{ base: 'xs', md: 'sm' }}
            />
          </Tooltip>

          <Tooltip content={t('draw.controls.tool.tooltip.redo')}>
            <IconButton
              variant="ghost"
              disabled={!canRedoDrawAction}
              onClick={redoLastUndone}
              icon="redo"
              size={{ base: 'xs', md: 'sm' }}
            />
          </Tooltip>
        </ButtonGroup>
        <Tooltip content={t('draw.controls.tool.tooltip.deleteselected')}>
          <IconButton
            onClick={deleteSelected}
            colorPalette="red"
            icon="delete"
            size="sm"
            variant="ghost"
          />
        </Tooltip>
        <Switch
          size="sm"
          checked={snapEnabled}
          onCheckedChange={(e) => setSnapEnabled(e.checked)}
        >
          Snap
        </Switch>
      </HStack>
    </>
  );
};
