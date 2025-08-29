import { Separator, VStack } from '@kvib/react';
import { DrawControls } from '../../draw/drawControls/DrawControls';
import { ExportControls } from '../../draw/ExportControls';

export const DrawSettings = () => {
  return (
    <VStack gap={4} alignItems="flex-start">
      <DrawControls />
      <Separator dir="horizontal" />
      <ExportControls />
    </VStack>
  );
};
