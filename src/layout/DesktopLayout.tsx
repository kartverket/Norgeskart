import { Box, Grid, GridItem } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { MapComponent } from '../map/MapComponent';
import { BackgroundLayerPopover } from '../map/backgroundLayer/BackgroundLayerPopover';
import { MapControlButtons } from '../map/MapControlButtons';
import { mapToolAtom } from '../map/overlay/atoms';
import { SearchComponent } from '../search/SearchComponent';
import { selectedResultAtom } from '../search/atoms';
import { SidePanel } from '../sidePanel/SidePanel';
import { SideNavigation } from './SideNavigation';
import { Toolbar } from '../toolbar/Toolbar';

export const DesktopLayout = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const currentMapTool = useAtomValue(mapToolAtom);
  const selectedResult = useAtomValue(selectedResultAtom);
  const isPanelOpen = currentMapTool !== null || selectedResult !== null;
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

        <Box
          position="absolute"
          left="10px"
          bottom="6px"
          zIndex={1}
        >
          <BackgroundLayerPopover />
        </Box>

        <Box
          position="absolute"
          right="10px"
          bottom="6px"
          zIndex={1}
        >
          <MapControlButtons />
        </Box>

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
          bottom="150px"
          right={0}
          width="100%"
          maxWidth="400px"
          overflow="hidden"
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
