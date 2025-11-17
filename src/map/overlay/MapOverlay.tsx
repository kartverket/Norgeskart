import { Box, Image, Link, Portal } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useDrawSettings } from '../../draw/drawControls/hooks/drawSettings';
import { InfoBox } from '../../search/infobox/InfoBox';
import { SearchComponent } from '../../search/SearchComponent';
import { ErrorBoundary } from '../../shared/ErrorBoundary';
import { Toolbar } from '../../toolbar/Toolbar';
import { displayCompassOverlayAtom } from '../atoms';
import { MapControlButtons } from '../MapControlButtons';
import { mapToolAtom, showSearchComponentAtom } from './atoms';
import { Compass } from './Compass';
import { MapToolButtons } from './MapToolButtons';
import { MapToolCards } from './MapToolCards';

export type MapTool = 'layers' | 'draw' | 'settings' | null;

export const MapOverlay = () => {
  const [portalTargetFound, setPortalTargetFound] = useState<boolean>(false);
  const portalRef = useRef<HTMLElement>(null);
  const displayCompassOverlay = useAtomValue(displayCompassOverlayAtom);
  const { drawEnabled, setDrawEnabled } = useDrawSettings();
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);
  const showSearchComponent = useAtomValue(showSearchComponentAtom);

  useEffect(() => {
    if (!portalRef.current) {
      setTimeout(() => {
        const portalTargetElement = document.getElementById(
          'custom-control-portal',
        );
        portalRef.current = portalTargetElement;
        setPortalTargetFound(true);
      }, 10);
    }
    return () => {
      portalRef.current = null;
      setPortalTargetFound(false);
    };
  }, []);

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
      {portalTargetFound && (
        <Portal container={portalRef}>
          <Box
            position="absolute"
            width="100%"
            maxWidth="400px"
            zIndex="overlay"
            left="0"
          >
            {showSearchComponent && <SearchComponent />}
          </Box>
          {displayCompassOverlay && <Compass />}

          <Box position="absolute" bottom="30px" left="16px">
            <Link
              href="https://www.kartverket.no"
              target="_blank"
              rel="noopener noreferrer"
              outline="none"
            >
              <Image
                src="/logos/KV_logo_staa.svg"
                alt="Logo"
                style={{ height: 64 }}
              />
            </Link>
          </Box>

          {/* Her er hovedboksen for knappene i senter */}
          <Box
            position="absolute"
            bottom="40px"
            left="50%"
            transform="translateX(-50%)"
            zIndex={10}
            bg="#FFFF"
            borderRadius="lg"
            p={2}
            boxShadow="lg"
          >
            <MapToolButtons />
          </Box>
          <MapToolCards
            currentMapTool={currentMapTool}
            onClose={() => {
              setCurrentMapTool(null);
            }}
          />

          <InfoBox />
          <MapControlButtons />
          <Toolbar />
        </Portal>
      )}
    </ErrorBoundary>
  );
};
