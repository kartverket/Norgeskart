import { SimpleGrid } from '@kvib/react';
import { BackgroundLayerSettings } from './BackgroundLayerSettings';
import { CompassSettings } from './CompassSettings';
import { MapThemes } from './Mapthemes';
import { ProjectionSettings } from './ProjectionSettings';

export const MapSettings = () => {
  return (
    <SimpleGrid columns={1} gap="7">
      <BackgroundLayerSettings />
      <MapThemes />
      <ProjectionSettings />
      <CompassSettings />
    </SimpleGrid>
  );
};
