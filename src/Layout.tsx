import { Flex, Grid, GridItem, useBreakpointValue, Box } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { BottomDrawToolSelector } from './draw/BottomDrawToolSelector';
import { drawPanelCollapsedAtom } from './map/overlay/atoms';
import { displayCompassOverlayAtom } from './map/atoms';
import { useFeatureInfoClick } from './map/featureInfo/useFeatureInfo';
import { MapComponent } from './map/MapComponent';
import { MapControlButtons } from './map/MapControlButtons';
import { mapToolAtom, showSearchComponentAtom } from './map/overlay/atoms';
import { Compass } from './map/overlay/Compass';
import { LinkLogo } from './map/overlay/LinkLogo';
import { MapToolButtons } from './map/overlay/MapToolButtons';
import { MapToolCards } from './map/overlay/MapToolCards';
import { PrintDialog } from './print/PrintDialog';
import { selectedResultAtom, useSearchEffects } from './search/atoms';
import { useMapClickSearch } from './search/hooks';
import { InfoBox } from './search/infobox/InfoBox';
import { SearchComponent } from './search/SearchComponent';
import { ErrorBoundary } from './shared/ErrorBoundary';
import { useIsMobileScreen } from './shared/hooks';
import { Toolbar } from './toolbar/Toolbar';

export type MapTool = 'layers' | 'draw' | 'info' | 'settings' | null;

export const Layout = () => {
  const displayCompassOverlay = useAtomValue(displayCompassOverlayAtom);
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);
  const showSearchComponent = useAtomValue(showSearchComponentAtom);
  const isMobile = useIsMobileScreen();
  const isToolOpen = currentMapTool !== null;
  const isLargeScreen = useBreakpointValue({
    base: false,
    lg: true,
  });
  const selectedResult = useAtomValue(selectedResultAtom);
  const [collapsed, setCollapsed] = useAtom(drawPanelCollapsedAtom);

  useEffect(() => {
    if (currentMapTool !== 'draw') {
      setCollapsed(false);
    }
  }, [currentMapTool, setCollapsed]);
  useFeatureInfoClick();
  useSearchEffects();
  useMapClickSearch();

  return (
    <ErrorBoundary
      fallback={undefined}
      onError={() => {
        console.error('Error in MapOverlay');
      }}
    >
      {displayCompassOverlay && <Compass />}
      <Grid
        position={'relative'}
        height={'100dvh'}
        width={'100dvw'}
        gridTemplateColumns="repeat(12, 1fr)"
        gridTemplateRows={{
          base: 'repeat(4, 1fr)',
          md: 'repeat(4, 1fr)  120px 40px',
        }}
        pointerEvents="auto"
        bg="gray.200"
      >
        <GridItem
          gridColumn="1 / span 12" /* span all columns */
          gridRow={{ base: '1 / span 4', md: '1 / -1' }} /* span all rows */
          zIndex={0}
        >
          <MapComponent />
        </GridItem>
        {(showSearchComponent || !isLargeScreen) && (
          <GridItem
            gridColumn={{
              base: '1 / span 12',
              md: '1 / span 6',
              lg: '1 / span 4',
              xl: '1 / span 3',
            }}
            gridRow={{ base: '1 / span 3', md: '1 / span 4' }}
            display={{
              base: selectedResult == null ? 'block' : 'none',
              md: 'block',
            }}
            zIndex={1}
            pointerEvents={'none'}
          >
            <SearchComponent />
          </GridItem>
        )}

        <GridItem
          gridColumn={{
            base: '1 / span 12',
            md: '1 / span 6',
            lg: '1 / span 4',
            xl: '1 / span 3',
            '2xl': '1 / span 2',
          }}
          gridRow={{ base: '2 / span 3', md: '1 / span 4' }}
          zIndex={1}
          alignItems={{ base: 'flex-end', md: 'stretch' }}
          display={{ base: 'flex', md: 'block' }}
          pointerEvents={'none'}
        >
          <Box
            display={currentMapTool === 'draw' && collapsed ? 'none' : 'block'}
            pointerEvents={
              currentMapTool === 'draw' && collapsed ? 'none' : 'auto'
            }
            w="100%"
          >
            <MapToolCards
              currentMapTool={currentMapTool}
              onClose={() => {
                setCurrentMapTool(null);
                setCollapsed(false);
              }}
            />
          </Box>
        </GridItem>

        <GridItem
          gridColumn={{
            base: '1 / span 12',
            md: '8 / span 5',
            lg: '9 / span 4',
            xl: '10 / span 3',
          }}
          gridRow={{ base: '1 / span 3', md: '1', lg: '1 / span 3' }}
          zIndex={1}
          pointerEvents={'none'}
        >
          <Flex maxHeight={'100%'} w={'100%'} justifyContent={'flex-end'}>
            <InfoBox />
            <PrintDialog />
          </Flex>
        </GridItem>

        <GridItem
          gridColumn={{ base: '1 / span 3' }}
          gridRow={{ base: 4, md: 5 }}
          alignContent={{ base: 'end', md: 'end' }}
          mb={{ base: 3, md: 4 }}
          ml={{ base: 2, md: 3 }}
          display={{ base: isToolOpen ? 'none' : 'block', md: 'block' }}
          zIndex={1}
          pointerEvents={'none'}
        >
          <LinkLogo />
        </GridItem>

        <GridItem
          gridColumn={{
            base: '1 / span 12',
            md: '2 / span 10',
            lg: '2 / span 9',
          }}
          gridRow={5}
          alignContent={'end'}
          justifySelf={{ md: 'center' }}
          mb={{ base: 0, md: 4 }}
          zIndex={1}
          pointerEvents={'none'}
        >
          <MapToolButtons />
        </GridItem>

        <GridItem
          justifySelf="end"
          alignContent="end"
          gridRow={{ base: 4, md: '3 / span 3' }}
          gridColumn={'12 / span 3'}
          mb={{ base: 3, md: 16 }}
          mr={{ base: 2, md: 3 }}
          display={{ base: isToolOpen ? 'none' : 'block', md: 'block' }}
          zIndex={1}
          pointerEvents={'none'}
        >
          <MapControlButtons />
        </GridItem>

        {!isMobile && (
          <GridItem
            h="40px"
            alignContent="end"
            gridRow={6}
            gridColumn={'1 / -1'}
            justifyContent={'end'}
            zIndex={1}
            pointerEvents={'none'}
          >
            <Toolbar />
          </GridItem>
        )}
      </Grid>
      {isMobile && currentMapTool === 'draw' && <BottomDrawToolSelector />}
    </ErrorBoundary>
  );
};
