import { SimpleGrid } from '@kvib/react';

import { MapThemes } from './MapThemes';

export const MapSettings = () => {
  return (
    <SimpleGrid columns={1} gap="7">
      <MapThemes />
    </SimpleGrid>
  );
};
