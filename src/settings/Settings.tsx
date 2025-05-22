import { VStack } from '@kvib/react';
import { BackgroundLayerSettings } from './BackgroundLayerSettings';

import { ProjectionSettings } from './ProjectionSettings';

export const Settings = () => {
  return (
    <VStack
      height={'100%'}
      w={'320px'}
      gap={4}
      padding={4}
      justifyContent={'flex-start'}
    >
      <ProjectionSettings />
      <BackgroundLayerSettings />
    </VStack>
  );
};
