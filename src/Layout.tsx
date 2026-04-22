import { Flex, Grid, GridItem, VStack, useBreakpointValue } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { BottomDrawToolSelector } from './draw/BottomDrawToolSelector';
import { displayCompassOverlayAtom } from './map/atoms';
import { BackgroundLayerSwitcher } from './map/BackgroundLayerSwitcher';
import { useFeatureInfoClick } from './map/featureInfo/useFeatureInfo';
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
import { InfoBox } from './search/infobox/InfoBox';
import { SearchComponent } from './search/SearchComponent';
import { ErrorBoundary } from './shared/ErrorBoundary';
import { useIsMobileScreen } from './shared/hooks';
import { Toolbar } from './toolbar/Toolbar';

export type MapTool = 'layers' | 'draw' | 'info' | 'settings' | null;

export const Layout = () => {
  const displayCompassOverlay = useAtomValue(displayCompassOverlayAtom);
  const showSearchComponent = useAtomValue(showSearchComponentAtom);
  const isMobile = useIsMobileScreen();
  const isLargeScreen = useBreakpointValue({
    base: false,
    lg: true,
  });
  const selectedResult = useAtomValue(selectedResultAtom);
  const currentMapTool = useAtomValue(mapToolAtom);
  const isPrintDialogOpen = useAtomValue(isPrintDialogOpenAtom);

  useFeatureInfoClick();
  useSearchEffects();
  useMapClickSearch();

  const isToolOpen = currentMapTool !== null;
  return (
    <ErrorBoundary fallback={undefined}>
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
        style={{ overflowY: 'hidden' }}
      >
        <GridItem
          gridColumn="1 / span 12" /* span all columns */
          gridRow={{ base: '1 / span 4', md: '1 / -1' }} /* span all rows */
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
            <ErrorBoundary fallback={undefined} name={'SearchComponent'}>
              <SearchComponent />
            </ErrorBoundary>
          </GridItem>
        )}

        <GridItem
          gridColumn={{
            base: '1 / span 12',
            md: '1 / span 6',
            lg: '1 / span 5',
            xl: '1 / span 4',
            '2xl': '1 / span 3',
          }}
          gridRow={{ base: '2 / span 3', md: '1 / span 4' }}
          zIndex={2}
          alignItems={{ base: 'flex-end', md: 'stretch' }}
          display={{ base: 'flex', md: 'block' }}
          pointerEvents={'none'}
        >
          <ErrorBoundary fallback={undefined} name="MapToolCards">
            <MapToolCards />
          </ErrorBoundary>
        </GridItem>

        <GridItem
          gridColumn={{
            base: '1 / span 12',
            md: '8 / span 7',
            lg: '9 / span 4',
            xl: '10 / span 3',
          }}
          gridRow={{ base: '1 / span 3', md: '1', lg: '1 / span 3' }}
          zIndex={2}
          pointerEvents={'none'}
        >
          <Flex justifyContent={'flex-end'}>
            <ErrorBoundary fallback={undefined} name={'InfoBox'}>
              <InfoBox />
            </ErrorBoundary>
            <ErrorBoundary fallback={undefined} name={'PrintDialog'}>
              {isPrintDialogOpen && <PrintDialog />}
            </ErrorBoundary>
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
            lg: '2 / span 10',
          }}
          gridRow={5}
          alignContent={'end'}
          justifySelf={{ md: 'center' }}
          mb={{ base: 0, md: 4 }}
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
          gridRow={{ base: 4, md: '3 / span 3' }}
          gridColumn={'12 / span 3'}
          mb={{
            base: 3,
            md: 4,
          }}
          mr={{ base: 2, md: 3 }}
          display={{ base: isToolOpen ? 'none' : 'block', md: 'block' }}
          zIndex={1}
          pointerEvents={'none'}
        >
          <VStack alignItems="flex-end" gap={2} pointerEvents="auto">
            <ErrorBoundary fallback={undefined} name={'MapControlButtons'}>
              <MapControlButtons />
            </ErrorBoundary>
            <ErrorBoundary
              fallback={undefined}
              name={'BackgroundLayerSwitcher'}
            >
              <BackgroundLayerSwitcher />
            </ErrorBoundary>
          </VStack>
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
            <ErrorBoundary fallback={undefined} name={'Toolbar'}>
              <Toolbar />
            </ErrorBoundary>
          </GridItem>
        )}
      </Grid>
      {isMobile && currentMapTool === 'draw' && (
        <ErrorBoundary fallback={undefined} name={'BottomDrawToolSelector'}>
          <BottomDrawToolSelector />
        </ErrorBoundary>
      )}
    </ErrorBoundary>
  );
};
