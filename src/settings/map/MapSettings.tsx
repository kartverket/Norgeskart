import { Button, VStack } from '@kvib/react';
import { BackgroundLayerSettings } from './BackgroundLayerSettings';

import { useMapSettings } from '../../map/mapHooks';
import { CompassSettings } from './CompassSettings';
import { ProjectionSettings } from './ProjectionSettings';

export const MapSettings = () => {
  const { setBackgroundWMSLayer } = useMapSettings();
  return (
    <VStack>
      <ProjectionSettings />
      <BackgroundLayerSettings />
      <CompassSettings />
      <Button onClick={() => setBackgroundWMSLayer('oceanicelectronic')}>
        Hav?
      </Button>
    </VStack>
  );
};
