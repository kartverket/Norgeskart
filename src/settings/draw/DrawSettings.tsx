import { VStack } from '@kvib/react';
import { DrawControls } from '../../draw/DrawControls';
import { ExportControls } from '../../draw/ExportControls';

export const DrawSettings = () => {
  return (
    <VStack gap={4} alignItems="flex-start">
      <DrawControls />
      <ExportControls />
    </VStack>
  );
};
