import { Heading, HStack, IconButton, Switch, Tooltip } from '@kvib/react';
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
import { DrawType, useDrawSettings } from './hooks/drawSettings';

type EditControlsProps = {
  drawType: DrawType | null;
  showActions?: boolean;
};

export const EditControls = ({
  drawType,
  showActions = true,
}: EditControlsProps) => {
  const { addDrawAction } = useDrawActionsState();
  const [snapEnabled, setSnapEnabled] = useAtom(snapEnabledAtom);

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

  const showSnapControl = drawType === 'LineString' || drawType === 'Polygon';
  const showDeleteControl = drawType === 'Move';

  return (
    <>
      {showSnapControl && (
        <HStack width="100%" justifyContent="space-between">
          <Heading size={{ base: 'xs', md: 'sm' }}>Snapp til linje</Heading>
          <Switch
            size="sm"
            aria-label="Snapp til linje"
            checked={snapEnabled}
            onCheckedChange={(e) => setSnapEnabled(e.checked)}
          />
        </HStack>
      )}
      {showActions && <DrawActionControls showDeleteControl={showDeleteControl} />}
    </>
  );
};

export const DrawActionControls = ({
  showDeleteControl,
  marginTop = 2,
}: {
  showDeleteControl: boolean;
  marginTop?: number;
}) => {
  const { deleteSelected } = useDrawSettings();
  const { undoLast, redoLastUndone } = useDrawActions();
  const canUndoDrawAction = useAtomValue(canUndoAtom);
  const canRedoDrawAction = useAtomValue(canRedoAtom);
  const { t } = useTranslation();

  return (
    <HStack marginTop={marginTop} wrap="wrap">
      <HStack gap={1}>
        <Tooltip content={t('draw.controls.tool.tooltip.undo')}>
          <IconButton
            variant="outline"
            disabled={!canUndoDrawAction}
            onClick={undoLast}
            icon="undo"
            size="sm"
            colorPalette="green"
            border="1px solid"
            borderColor="green.500"
            borderRadius="4px"
          />
        </Tooltip>

        <Tooltip content={t('draw.controls.tool.tooltip.redo')}>
          <IconButton
            variant="outline"
            disabled={!canRedoDrawAction}
            onClick={redoLastUndone}
            icon="redo"
            size="sm"
            colorPalette="green"
            border="1px solid"
            borderColor="green.500"
            borderRadius="4px"
          />
        </Tooltip>
      </HStack>
      {showDeleteControl && (
        <Tooltip content={t('draw.controls.tool.tooltip.deleteselected')}>
          <IconButton
            onClick={deleteSelected}
            variant="outline"
            colorPalette="red"
            icon="delete"
            size="sm"
            border="1px solid"
            borderColor="red.500"
            borderRadius="4px"
          />
        </Tooltip>
      )}
    </HStack>
  );
};
