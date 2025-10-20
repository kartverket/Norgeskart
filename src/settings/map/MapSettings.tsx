import { VStack } from '@kvib/react';
import { BackgroundLayerSettings } from './BackgroundLayerSettings';

import { CompassSettings } from './CompassSettings';
import { ProjectionSettings } from './ProjectionSettings';

export const MapSettings = () => {
  return (
    <VStack>
      <ProjectionSettings />
      <BackgroundLayerSettings />
      <CompassSettings />
    </VStack>
  );
};
