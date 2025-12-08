import { Grid, GridItem } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
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
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);
  const showSearchComponent = useAtomValue(showSearchComponentAtom);
  const isMobile = useIsMobileScreen();
  const isToolOpen = currentMapTool !== null;


  useFeatureInfoClick();

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
          base: 'repeat(12, 1fr)',
          md: 'repeat(11, 1fr)',
          lg: 'repeat(11, 1fr)',
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
            base: '1 / span 12',
            md: '1 / span 6',
            lg: '1 / span 10',
            xl: '1  / span 10',
          }}
          gridRow={1}
        >
          {showSearchComponent && <SearchComponent />}
        </GridItem>
        <GridItem
          gridColumn={{base:'1 / span 12', md:'1 / span 4'}}
          gridRow={{ base: 5, md: 1 }}
          zIndex={1}
        >
          <MapToolCards
            currentMapTool={currentMapTool}
            onClose={() => {
              setCurrentMapTool(null);
            }}
          />
        </GridItem>
        <GridItem gridColumn={{ base: '2 / span 10', md: '9 / span 4'}} gridRow={1}>
          <InfoBox />
        </GridItem>

        <GridItem
          gridColumn={{base:'1 / span 4'}}
          gridRow={{ base: 4, md: 5, lg: 5 }}
          alignContent={{base:'start', md:'end'}}
          mb={{base:'0', md:4}}
          ml={{base:'1', md:'4'}}
          display={{ base: isToolOpen ? 'none' : 'block', md: 'block' }}
        >
          <LinkLogo />
        </GridItem>

        <GridItem
          gridColumn={{
            base: '3 / span 9',
            md: '2 / span 10',
            lg: '2 / span 10',
          }}
          gridRow="5"
          alignContent={'end'}
          justifySelf={{ md: 'center' }}
          mb={{ base: 0, md: 4 }}
        >
          <MapToolButtons/>
        </GridItem>

        <GridItem
          justifySelf="end"
          alignContent="end"
          gridRow={{ base: 4, md: 5, lg: 5 }}
          gridColumn={{ base: 12, md: 12}}
          mb={{base:'3', md:'5'}}
          mr={{base:'2', md:'3'}}
          display={{ base: isToolOpen ? 'none' : 'block', md: 'block' }}
        >
          <MapControlButtons />
        </GridItem>

        {!isMobile && (
          <GridItem h="40px" alignContent="end" gridRow={6} colSpan={12}>
            <Toolbar />
          </GridItem>
        )}
      </Grid>
    </ErrorBoundary>
  );
};
