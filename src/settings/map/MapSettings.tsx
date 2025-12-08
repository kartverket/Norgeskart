import { SimpleGrid } from '@kvib/react';

import { MapThemes } from './MapThemes';

export const MapSettings = () => {
  return (
    <SimpleGrid columns={1} gap={{base:'0', md:'7'}}>
      <MapThemes />
    </SimpleGrid>
  );
};
