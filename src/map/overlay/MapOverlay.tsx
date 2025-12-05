import { Grid, GridItem } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useDrawSettings } from '../../draw/drawControls/hooks/drawSettings';
import { InfoBox } from '../../search/infobox/InfoBox';
import { SearchComponent } from '../../search/SearchComponent';
import { ErrorBoundary } from '../../shared/ErrorBoundary';
import { useIsMobileScreen } from '../../shared/hooks';
import { Toolbar } from '../../toolbar/Toolbar';
import { displayCompassOverlayAtom } from '../atoms';
import { useFeatureInfoClick } from '../featureInfo/useFeatureInfo';
import { MapControlButtons } from '../MapControlButtons';
import { mapToolAtom, showSearchComponentAtom } from './atoms';
import { Compass } from './Compass';
import { LinkLogo } from './LinkLogo';
import { MapToolButtons } from './MapToolButtons';
import { MapToolCards } from './MapToolCards';

export type MapTool = 'layers' | 'draw' | 'settings' | null;

export const MapOverlay = () => {
  const displayCompassOverlay = useAtomValue(displayCompassOverlayAtom);
  const { drawEnabled, setDrawEnabled } = useDrawSettings();
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);
  const showSearchComponent = useAtomValue(showSearchComponentAtom);
  const isMobile = useIsMobileScreen();

  useFeatureInfoClick();

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (currentMapTool !== 'draw' && drawEnabled) {
      setDrawEnabled(false);
    }
    if (currentMapTool === 'draw' && !drawEnabled) {
      setDrawEnabled(true);
    }
  }, [currentMapTool, setDrawEnabled]);
  /* eslint-enable react-hooks/exhaustive-deps */
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
        gridTemplateColumns={{
          base: '1fr',
          md: 'repeat(5, 1fr)',
        }}
        gridTemplateRows={{
          base: 'auto 1fr auto auto',
          md: '1fr 1fr 1fr 1fr auto auto',
          lg: '1fr auto auto',
        }}
        pointerEvents="none"
      >
        <GridItem
          gridColumn={{
            base: '1 / span 4',
            md: '1 / span 3',
            lg: '1 / span 2',
            xl: '1  / span 2',
          }}
          gridRow={1}
        >
          {showSearchComponent && <SearchComponent />}
        </GridItem>
        <GridItem
          gridColumn="1 / span 4"
          gridRow={{ base: 4, md: 1 }}
          zIndex={1}
        >
          <MapToolCards
            currentMapTool={currentMapTool}
            onClose={() => {
              setCurrentMapTool(null);
            }}
          />
        </GridItem>
        <GridItem gridColumn={{ base: 1, md: 5 }} gridRow={1}>
          <InfoBox />
        </GridItem>

        <GridItem
          gridColumn="1"
          gridRow={{ base: 4, md: 5, lg: 5 }}
          alignContent="end"
          mb={4}
          ml={4}
        >
          <LinkLogo />
        </GridItem>

        <GridItem
          gridColumn={{
            base: '1 / span 4',
            md: '2 / span 3',
            lg: '2 / span 3',
          }}
          gridRow="5"
          alignContent={'end'}
          justifySelf={{ md: 'center' }}
          mb={{ base: 0, md: 4 }}
        >
          <MapToolButtons />
        </GridItem>

        <GridItem
          justifySelf="end"
          alignContent="end"
          gridRow={{ base: 4, md: 5, lg: 5 }}
          gridColumn={{ base: 3, md: 5 }}
          mb={5}
          mr={4}
        >
          <MapControlButtons />
        </GridItem>

        {!isMobile && (
          <GridItem h="40px" alignContent="end" gridRow={6} colSpan={5}>
            <Toolbar />
          </GridItem>
        )}
      </Grid>
    </ErrorBoundary>
  );
};
