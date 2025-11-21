import { SimpleGrid } from '@kvib/react';
import { BackgroundLayerSettings } from './BackgroundLayerSettings';
import { MapThemes } from './MapThemes';
import { Symbolology } from './Symbolology';

export const MapSettings = () => {
  return (
    <SimpleGrid columns={1} gap="7">
      <BackgroundLayerSettings />
      <MapThemes />
      <Symbolology />
    </SimpleGrid>
  );
};
