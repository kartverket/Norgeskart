import { Box, Grid, GridItem } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { MapComponent } from '../map/MapComponent';
import { MapControlButtons } from '../map/MapControlButtons';
import { displayCompassOverlayAtom } from '../map/atoms';
import { BackgroundLayerPopover } from '../map/backgroundLayer/BackgroundLayerPopover';
import { Compass } from '../map/overlay/Compass';
import { mapToolAtom } from '../map/overlay/atoms';
import { SearchComponent } from '../search/SearchComponent';
import { selectedResultAtom } from '../search/atoms';
import { SidePanel } from '../sidePanel/SidePanel';
import { BottomControls } from './BottomControls';
import { SideNavigation } from './SideNavigation';
// import { ScaleSelector } from '../toolbar/ScaleSelector';

export const DesktopLayout = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const displayCompassOverlay = useAtomValue(displayCompassOverlayAtom);
  const currentMapTool = useAtomValue(mapToolAtom);
  const selectedResult = useAtomValue(selectedResultAtom);
  const isPanelOpen =
    (currentMapTool !== null && currentMapTool !== 'measure') ||
    selectedResult !== null;
  const navigationWidth = isMinimized ? '50px' : '94px';

  return (
    <Grid
      height="100dvh"
      width="100%"
      gridTemplateColumns={`${navigationWidth} minmax(0, 1fr)`}
      gridTemplateRows="minmax(0, 1fr)"
      overflow="hidden"
      bg="gray.200"
    >
      <GridItem gridRow="span 1">
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
        {displayCompassOverlay && <Compass />}

        <Box
          position="absolute"
          left={isPanelOpen ? '374px' : '10px'}
          bottom="6px"
          zIndex={1}
        >
          <BackgroundLayerPopover />
        </Box>

        <Box position="absolute" right="10px" bottom="6px" zIndex={1}>
          <MapControlButtons />
        </Box>

        <Box
          position="absolute"
          left="50%"
          bottom="6px"
          transform="translateX(-50%)"
          zIndex={1}
          pointerEvents="auto"
          bg="#FFFF"
          borderRadius="4px"
          shadow="lg"
          px={1}
          py={1}
        >
          <BottomControls />
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
          pointerEvents="none"
        >
          <SearchComponent />
        </Box>
      </GridItem>
    </Grid>
  );
};
