import { Separator, VStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { DrawControls } from '../../draw/drawControls/DrawControls';
import { ExportControls } from '../../draw/export/ExportControls';
import { drawEnabledEffect, drawTypeEffect } from './atoms';

export const DrawSettings = () => {
  useAtom(drawEnabledEffect);
  useAtom(drawTypeEffect);
  return (
    <VStack gap={4} alignItems="flex-start">
      <DrawControls />
      <Separator dir="horizontal" />
      <ExportControls />
    </VStack>
  );
};
