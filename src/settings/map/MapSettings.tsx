import { SimpleGrid } from '@kvib/react';
import { BackgroundLayerSettings } from './BackgroundLayerSettings';
import { MapThemes } from './MapThemes';

export const MapSettings = () => {
  return (
    <SimpleGrid columns={1} gap="7">
      <BackgroundLayerSettings />
      <MapThemes />
    </SimpleGrid>
  );
};
