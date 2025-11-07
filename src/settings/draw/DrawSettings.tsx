import { Flex } from '@kvib/react';
import { DrawControls } from '../../draw/drawControls/DrawControls';
import { ExportControls } from '../../draw/ExportControls';

export const DrawSettings = () => (
  <Flex direction="row" justifyContent="space-between" gap={10}>
    <DrawControls />
    <ExportControls />
  </Flex>
);
