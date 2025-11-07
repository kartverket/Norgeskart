import { Grid, GridItem } from '@kvib/react';
import { BackgroundLayerSettings } from './BackgroundLayerSettings';
import { MapThemes } from './MapThemes';
import { ProjectionSettings } from './ProjectionSettings';

export const MapSettings = () => (
  <>
    <Grid templateColumns={{ md: 'repeat(3, 1fr)' }} gap={20}>
      <GridItem colSpan={1}>
        <BackgroundLayerSettings />
        <ProjectionSettings />
      </GridItem>
      <GridItem colSpan={2}>
        <MapThemes />
      </GridItem>

      {/*<CompassSettings />*/}
    </Grid>
  </>
);
