import { Flex, Grid, GridItem, HStack, useBreakpointValue } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { PrintDialog } from '../../print/PrintDialog';
import { selectedResultAtom, useSearchEffects } from '../../search/atoms';
import { useMapClickSearch } from '../../search/hooks';
import { InfoBox } from '../../search/infobox/InfoBox';
import { SearchComponent } from '../../search/SearchComponent';
import { ErrorBoundary } from '../../shared/ErrorBoundary';
import { useIsMobileScreen } from '../../shared/hooks';
import { Toolbar } from '../../toolbar/Toolbar';
import { displayCompassOverlayAtom, displayMapLegendAtom } from '../atoms';
import { useFeatureInfoClick } from '../featureInfo/useFeatureInfo';
import { activeThemeLayersAtom } from '../layers/atoms';
import { MapLegend } from '../legend/MapLegend';
import { MapControlButtons } from '../MapControlButtons';
import { mapToolAtom, showSearchComponentAtom } from './atoms';
import { Compass } from './Compass';
import { LinkLogo } from './LinkLogo';
import { MapToolButtons } from './MapToolButtons';
import { MapToolCards } from './MapToolCards';

export type MapTool = 'layers' | 'draw' | 'info' | 'settings' | null;

export const MapOverlay = () => {
  const displayCompassOverlay = useAtomValue(displayCompassOverlayAtom);
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);
  const showSearchComponent = useAtomValue(showSearchComponentAtom);
  const displayMapLegend = useAtomValue(displayMapLegendAtom);
  const themeLayers = useAtomValue(activeThemeLayersAtom);
  const isMobile = useIsMobileScreen();
  const isToolOpen = currentMapTool !== null;
  const isLargeScreen = useBreakpointValue({
    base: false,
    lg: true,
  });
  const selectedResult = useAtomValue(selectedResultAtom);

  const shouldDisplayLegend =
    themeLayers.size > 0 && displayMapLegend && isLargeScreen;
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
        position={'absolute'}
        height={'100%'}
        width={'100%'}
        gridTemplateColumns="repeat(12, 1fr)"
        gridTemplateRows={{
          base: 'repeat(4, 1fr)',
          md: 'repeat(4, 1fr)  120px 40px',
        }}
        pointerEvents="none"
      >
        <GridItem
          gridColumn={{
            base: '1 / span 12',
            md: '1 / span 6',
            lg: '1 / span 4',
            xl: '1 / span 3',
          }}
          gridRow={{ base: '1 / span 3', md: '1 / span 4' }}
          onClick={(e) => e.stopPropagation()}
          display={{
            base: selectedResult == null ? 'block' : 'none',
            md: 'block',
          }}
        >
          {(showSearchComponent || !isLargeScreen) && <SearchComponent />}
        </GridItem>
        <GridItem
          gridColumn={{
            base: '1 / span 12',
            md: '1 / span 6',
            lg: '1 / span 4',
            xl: '1 / span 3',
            '2xl': '1 / span 2',
          }}
          gridRow={{ base: '2 / span 4', md: '1 / span 4' }}
          zIndex={1}
          alignItems={{ base: 'flex-end', md: 'stretch' }}
          display={{ base: 'flex', md: 'block' }}
        >
          <MapToolCards
            currentMapTool={currentMapTool}
            onClose={() => {
              setCurrentMapTool(null);
            }}
          />
        </GridItem>
        <GridItem
          gridColumn={{
            base: '1 / span 12',
            md: '8 / span 5',
            lg: '9 / span 4',
            xl: '10 / span 3',
          }}
          gridRow={{ base: '1 / span 3', md: '1', lg: '1 / span 3' }}
          zIndex={2}
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
        >
          <HStack alignItems={'flex-end'}>
            <MapControlButtons />
            {shouldDisplayLegend && <MapLegend />}
          </HStack>
        </GridItem>

        {!isMobile && (
          <GridItem
            h="40px"
            alignContent="end"
            gridRow={6}
            colSpan={12}
            justifyContent={'end'}
          >
            <Toolbar />
          </GridItem>
        )}
      </Grid>
    </ErrorBoundary>
  );
};
