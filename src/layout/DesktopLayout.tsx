import { Box, Grid, GridItem } from '@kvib/react';
import { useState } from 'react';
import { MapComponent } from '../map/MapComponent';
import { SearchComponent } from '../search/SearchComponent';
import { SidePanel } from '../sidePanel/SidePanel';
import { SideNavigation } from './SideNavigation';
import { Toolbar } from '../toolbar/Toolbar';

export const DesktopLayout = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const navigationWidth = isMinimized ? '50px' : '94px';

  return (
    <Grid
      height="100dvh"
      width="100%"
      gridTemplateColumns={`${navigationWidth} minmax(0, 1fr)`}
      gridTemplateRows="minmax(0, 1fr) 40px"
      overflow="hidden"
      bg="gray.200"
    >
      <GridItem gridRow="span 2">
        <SideNavigation
          isMinimized={isMinimized}
          onToggleMinimized={() => setIsMinimized(!isMinimized)}
          onOpenPanel={() => setIsPanelOpen(true)}
        />
      </GridItem>

      <GridItem
        gridColumn={2}
        gridRow={1}
        position="relative"
        minWidth={0}
        minHeight={0}
      >
        <MapComponent />

        {isPanelOpen && (
          <Box
            position="absolute"
            top={0}
            left={0}
            width="364px"
            height="100%"
            zIndex={2}
          >
            <SidePanel />
          </Box>
        )}

        <Box
          position="absolute"
          top={0}
          right={0}
          width="100%"
          maxWidth="400px"
          zIndex={1}
        >
          <SearchComponent />
        </Box>
      </GridItem>

      <GridItem gridColumn={2} gridRow={2}>
        <Toolbar />
      </GridItem>
    </Grid>
  );
};
