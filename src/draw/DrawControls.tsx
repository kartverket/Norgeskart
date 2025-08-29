import { Button, VStack } from '@kvib/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDrawSettings } from '../draw/drawHooks.ts';
import { useDrawActions } from '../settings/draw/drawActions/drawActionsHooks.ts';
import { useIsMobileScreen } from '../shared/hooks.ts';
import { ColorControls } from './ColorControls.tsx';
import { DrawControlFooter } from './DrawControlsFooter.tsx';
import { DrawToolSelector } from './DrawToolSelector.tsx';
import { LineWidthControl } from './LineWidthControl.tsx';
import { MeasurementControls } from './MeasurementControls.tsx';

export const DrawControls = () => {
  const { drawType, drawEnabled, abortDrawing, deleteSelected } =
    useDrawSettings();
  const { undoLast, redoLastUndone } = useDrawActions();
  const isMobile = useIsMobileScreen();
  const { t } = useTranslation();

  useEffect(() => {
    const keyListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        abortDrawing();
      }
    };
    document.addEventListener('keydown', keyListener);
    return () => {
      document.removeEventListener('keydown', keyListener);
    };
  }, [abortDrawing]);

  useEffect(() => {
    const keyListener = (event: KeyboardEvent) => {
      if (event.key === 'Delete') {
        deleteSelected();
      }
    };
    document.addEventListener('keydown', keyListener);
    return () => {
      document.removeEventListener('keydown', keyListener);
    };
  }, [deleteSelected]);

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

  return (
    <VStack alignItems={'flex-start'} width={'100%'}>
      <DrawToolSelector />
      <ColorControls />
      {isMobile && drawType == 'Move' && (
        <Button onClick={deleteSelected}>{t('draw.deleteSelection')}</Button>
      )}
      <LineWidthControl />
      <MeasurementControls />
      <DrawControlFooter />
    </VStack>
  );
};
