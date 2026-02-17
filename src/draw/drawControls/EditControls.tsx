import { Heading, HStack, IconButton, Tooltip } from '@kvib/react';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DrawAction } from '../../settings/draw/drawActions/atoms';
import { useDrawActionsState } from '../../settings/draw/drawActions/drawActionsHooks';
import { StyleChangeDetail } from './hooks/drawEventHandlers';
import { useDrawSettings } from './hooks/drawSettings';
import { useVerticalMove } from './hooks/verticalMove';

export const EditControls = () => {
  const { moveSelectedUp, moveSelectedDown } = useVerticalMove();
  const { drawType } = useDrawSettings();
  const { addDrawAction } = useDrawActionsState();
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

  if (drawType !== 'Move') {
    return null;
  }
  return (
    <>
      <Heading size={{ base: 'sm', md: 'md' }}>
        {t('draw.controls.edit')}
      </Heading>
      <HStack marginTop={2}>
        <Tooltip content={t('draw.controls.tool.tooltip.movedown')}>
          <IconButton
            onClick={() => {
              moveSelectedUp();
            }}
            icon={'arrow_cool_down'}
            variant="plain"
            size={{ base: 'xs', md: 'md' }}
          />
        </Tooltip>
        <Tooltip content={t('draw.controls.tool.tooltip.moveup')}>
          <IconButton
            onClick={() => {
              moveSelectedDown();
            }}
            icon={'arrow_warm_up'}
            variant="ghost"
            size={{ base: 'xs', md: 'md' }}
          />
        </Tooltip>
      </HStack>
    </>
  );
};
