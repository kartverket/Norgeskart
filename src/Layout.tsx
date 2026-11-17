import {
  Box,
  Flex,
  Grid,
  GridItem,
  VStack,
  useBreakpointValue,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { BottomDrawToolSelector } from './draw/BottomDrawToolSelector';
import { DesktopLayout } from './layout/DesktopLayout';
import { displayCompassOverlayAtom } from './map/atoms';
import { BackgroundLayerPopover } from './map/backgroundLayer/BackgroundLayerPopover';
import { useFeatureInfoClick } from './map/featureInfo/useFeatureInfo';
import { useHoverOverlay } from './map/layers/config/backgroundLayers/useHoverOverlay';
import { MapComponent } from './map/MapComponent';
import { MapControlButtons } from './map/MapControlButtons';
import { mapToolAtom, showSearchComponentAtom } from './map/overlay/atoms';
import { Compass } from './map/overlay/Compass';
import { LinkLogo } from './map/overlay/LinkLogo';
import { MapToolButtons } from './map/overlay/MapToolButtons';
import { MapToolCards } from './map/overlay/MapToolCards';
import { isPrintDialogOpenAtom } from './print/atoms';
import { PrintDialog } from './print/PrintDialog';
import { selectedResultAtom, useSearchEffects } from './search/atoms';
import { useMapClickSearch } from './search/hooks';
import { MobileInfoBox } from './search/infobox/MobileInfoBox';
import { SearchComponent } from './search/SearchComponent';
import { ErrorBoundary } from './shared/ErrorBoundary';
import { useIsMobileScreen } from './shared/hooks';

export type MapTool =
  | 'layers'
  | 'draw'
  | 'info'
  | 'settings'
  | 'measure'
  | 'extent'
  | 'hiking'
  | 'elevationProfile'
  | null;

export const Layout = () => {
  const displayCompassOverlay = useAtomValue(displayCompassOverlayAtom);
  const showSearchComponent = useAtomValue(showSearchComponentAtom);
  const isMobile = useIsMobileScreen();
  const isLargeScreen = useBreakpointValue({
    base: false,
    md: false,
    lg: true,
  });
  const selectedResult = useAtomValue(selectedResultAtom);
  const currentMapTool = useAtomValue(mapToolAtom);
  const isPrintDialogOpen = useAtomValue(isPrintDialogOpenAtom);

  useFeatureInfoClick();
  useHoverOverlay();
  useSearchEffects();
  useMapClickSearch();

  const isToolOpen = currentMapTool !== null && currentMapTool !== 'measure';
  const hideLogo = selectedResult !== null || isPrintDialogOpen;
  const showMobileLogo = isMobile && !hideLogo && !isToolOpen;

  if (isLargeScreen) {
    return <DesktopLayout />;
  }

  return (
    <ErrorBoundary fallback={undefined}>
      {displayCompassOverlay && <Compass />}
      <Grid
        position={'relative'}
        height={'100dvh'}
        width={'100dvw'}
        gridTemplateColumns="repeat(12, 1fr)"
        gridTemplateRows="repeat(4, 1fr) 1fr auto"
        pointerEvents="auto"
        style={{ overflowY: 'hidden' }}
      >
        <GridItem
          gridColumn="1 / span 12" /* span all columns */
          gridRow={{ base: '1 / -1' }} /* span all rows */
          zIndex={0}
        >
          <ErrorBoundary fallback={undefined} name={'MapComponent'}>
            <MapComponent />
          </ErrorBoundary>
        </GridItem>
        {(showSearchComponent || !isLargeScreen) && (
          <GridItem
            gridColumn={{
              base: '1 / span 12',
              lg: '1 / span 4',
              xl: '1 / span 3',
            }}
            gridRow={{ base: '1 / span 3', lg: '1 / span 4' }}
            display="block"
            zIndex={1}
            pointerEvents={'none'}
          >
            <ErrorBoundary fallback={undefined} name={'SearchComponent'}>
              <SearchComponent />
            </ErrorBoundary>
          </GridItem>
        )}

        <GridItem
          gridColumn={{
            base: '1 / span 12',
            lg: '1 / span 5',
            xl: '1 / span 4',
            '2xl': '1 / span 3',
          }}
          gridRow={{ base: '1 / span 5', lg: '1 / span 4' }}
          zIndex={2}
          alignItems={{ base: 'flex-end', lg: 'stretch' }}
          display={{ base: 'flex', lg: 'block' }}
          pointerEvents={'none'}
        >
          <ErrorBoundary fallback={undefined} name="MapToolCards">
            <MapToolCards />
          </ErrorBoundary>
        </GridItem>

        <GridItem
          gridColumn={{
            base: '1 / span 12',
            lg: '9 / span 4',
            xl: '10 / span 3',
          }}
          gridRow={{ base: '1 / span 3', lg: '1 / span 3' }}
          zIndex={2}
          pointerEvents={'none'}
        >
          <Flex justifyContent={'flex-end'}>
            <ErrorBoundary fallback={undefined} name={'InfoBox'}>
              <MobileInfoBox />
            </ErrorBoundary>
            <ErrorBoundary fallback={undefined} name={'PrintDialog'}>
              {isPrintDialogOpen && <PrintDialog />}
            </ErrorBoundary>
          </Flex>
        </GridItem>

        <GridItem
          gridColumn={{ base: '1 / span 3' }}
          gridRow={{ base: 5 }}
          alignContent={{ base: 'end' }}
          mb={{
            base: 'calc(0.75rem + env(safe-area-inset-bottom))',
          }}
          ml={{
            base: 'calc(0.5rem + env(safe-area-inset-left))',
          }}
          display={{ base: 'block', lg: 'none' }}
          zIndex={1}
          pointerEvents={'none'}
        >
          {showMobileLogo && <LinkLogo />}
        </GridItem>

        <GridItem
          gridColumn={{
            base: '1 / span 12',
            lg: '2 / span 10',
          }}
          gridRow={{ base: 6, lg: 5 }}
          alignContent={{ base: 'flex-start', lg: 'end' }}
          justifySelf={{ lg: 'center' }}
          mb={{ base: 0, lg: 2 }}
          zIndex={1}
          pointerEvents={'none'}
        >
          <ErrorBoundary fallback={undefined} name={'MapToolButtons'}>
            <MapToolButtons />
          </ErrorBoundary>
        </GridItem>

        <GridItem
          justifySelf="end"
          alignContent="end"
          gridRow={{ base: 5, lg: '3 / span 3' }}
          gridColumn={'12 / span 3'}
          mb={{
            base: 'calc(0.75rem + env(safe-area-inset-bottom))',
            lg: 2,
          }}
          mr={{
            base: 'calc(0.5rem + env(safe-area-inset-right))',
            lg: 3,
          }}
          display={{ base: isToolOpen ? 'none' : 'block', lg: 'block' }}
          zIndex={1}
          pointerEvents={'none'}
        >
          <VStack alignItems="flex-end" gap={2} pointerEvents="auto">
            <ErrorBoundary fallback={undefined} name={'MapControlButtons'}>
              <MapControlButtons />
            </ErrorBoundary>
            <Box display={{ base: 'none', lg: 'block' }}>
              <ErrorBoundary
                fallback={undefined}
                name={'BackgroundLayerPopover'}
              >
                <BackgroundLayerPopover />
              </ErrorBoundary>
            </Box>
          </VStack>
        </GridItem>
      </Grid>
      {isMobile && currentMapTool === 'draw' && (
        <ErrorBoundary fallback={undefined} name={'BottomDrawToolSelector'}>
          <BottomDrawToolSelector />
        </ErrorBoundary>
      )}
    </ErrorBoundary>
  );
};
