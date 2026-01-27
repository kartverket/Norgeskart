import { Separator, VStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { DrawControls } from '../../draw/drawControls/DrawControls';
import { ExportControls } from '../../draw/export/ExportControls';
import { clearInteractions, drawEnabledEffect, drawTypeEffect } from './atoms';

export const DrawSettings = () => {
  useAtom(drawEnabledEffect);
  useAtom(drawTypeEffect);

  useEffect(() => {
    return () => {
      clearInteractions();
    };
  }, []);
  return (
    <VStack gap={4} alignItems="flex-start">
      <DrawControls />
      <Separator dir="horizontal" />
      <ExportControls />
    </VStack>
  );
};
