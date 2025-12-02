import { Grid, GridItem } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useDrawSettings } from '../../draw/drawControls/hooks/drawSettings';
import { InfoBox } from '../../search/infobox/InfoBox';
import { SearchComponent } from '../../search/SearchComponent';
import { ErrorBoundary } from '../../shared/ErrorBoundary';
import { useIsMobileScreen } from '../../shared/hooks';
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
          base: '1fr 1fr 1fr 110px',
          md: '1fr 1fr 1fr 1fr 40px',
        }}
        pointerEvents="none"
      >
        <GridItem gridColumn={1} gridRow={1} gridRowStart={1} gridRowEnd={5}>
          {showSearchComponent && <SearchComponent />}
          <MapToolCards
            currentMapTool={currentMapTool}
            onClose={() => {
              setCurrentMapTool(null);
            }}
          />
        </GridItem>
        <GridItem gridColumn={{ base: 1, md: 5 }} gridRow={1}>
        <GridItem gridColumn={{ base: 1, md: 5 }} gridRow={1}>
          <InfoBox />
        </GridItem>

        <GridItem
          gridColumn={1}
          gridRow={{ base: 3, md: 4 }}
          alignContent={'end'}
          mb={4}
          ml={4}
        >
        <GridItem
          gridColumn={1}
          gridRow={{ base: 3, md: 4 }}
          alignContent={'end'}
          mb={4}
          ml={4}
        >
          <LinkLogo />
        </GridItem>
        <GridItem
          gridColumn={{
            base: 1,
            md: 3,
          }}
          gridRow={4}
          alignContent={'end'}
          mb={{ base: 0, md: 4 }}
        >
          <MapToolButtons />
        </GridItem>
        <GridItem
          justifySelf={'end'}
          alignContent={'end'}
          gridColumn={{ base: 1, md: 5 }}
          gridRow={{ base: 3, md: 4 }}
          alignContent={'end'}
          gridColumn={{ base: 1, md: 5 }}
          gridRow={{ base: 3, md: 4 }}
          mb={4}
          mr={4}
        >
          <MapControlButtons />
        </GridItem>
        {!isMobile && (
          <GridItem h="40px" alignContent="end" gridRow={5} colSpan={5}>
            <Toolbar />
          </GridItem>
        )}
        {!isMobile && (
          <GridItem h="40px" alignContent="end" gridRow={5} colSpan={5}>
            <Toolbar />
          </GridItem>
        )}
      </Grid>
    </ErrorBoundary>
  );
};
