import { Box, HStack, IconButton, Image, Portal } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useDrawSettings } from '../../draw/drawControls/hooks/drawSettings';
import { useIsMobileScreen } from '../../shared/hooks';
import {
  displayCompassOverlayAtom,
  magneticDeclinationAtom,
  mapOrientationDegreesAtom,
  useMagneticNorthAtom,
} from '../atoms';
import { useCompassFileName, useMapSettings } from '../mapHooks';
import { MapToolButtons } from './MapToolButtons';
import { MapToolCards } from './MapToolCards';

export type MapTool = 'layers' | 'draw' | null;

export const MapOverlay = () => {
  const { setMapAngle, rotateSnappy } = useMapSettings();
  const mapOrientation = useAtomValue(mapOrientationDegreesAtom);
  const magneticDeclination = useAtomValue(magneticDeclinationAtom);
  const useMagneticNorth = useAtomValue(useMagneticNorthAtom);
  const [portalTargetFound, setPortalTargetFound] = useState<boolean>(false);
  const portalRef = useRef<HTMLElement>(null);
  const [zoomControlFound, setZoomControlFound] = useState<boolean>(false);
  const zoomRef = useRef<HTMLElement>(null);
  const displayCompassOverlay = useAtomValue(displayCompassOverlayAtom);
  const compassFileName = useCompassFileName();
  const isMobile = useIsMobileScreen();
  const { drawEnabled, setDrawEnabled } = useDrawSettings();
  const [currentMapTool, setCurrentMapTool] = useState<MapTool>(null);

  const compassOrientation =
    mapOrientation + (useMagneticNorth ? magneticDeclination : 0);

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

  useEffect(() => {
    if (!zoomRef.current) {
      setTimeout(() => {
        const olZoomControlElement = document.getElementsByClassName(
          'ol-zoom',
        )[0] as HTMLElement;
        zoomRef.current = olZoomControlElement;
        setZoomControlFound(true);
      }, 10);
    }
    return () => {
      zoomRef.current = null;
      setZoomControlFound(false);
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
    <>
      {portalTargetFound && (
        <Portal container={portalRef}>
          {displayCompassOverlay && (
            <Image
              rotate={compassOrientation + 'deg'}
              position="absolute"
              width="16%"
              top="42%"
              left="42%"
              src={compassFileName}
              userSelect="none"
              pointerEvents="none"
            />
          )}

          <Box position="absolute" bottom="16px" left="16px" zIndex={10}>
            <a
              href="https://www.kartverket.no"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/logos/KV_logo_staa.svg"
                alt="Logo"
                style={{ height: 64 }}
              />
            </a>
          </Box>

          {/* Her er hovedboksen for knappene i senter */}
          <Box position="absolute"
            bottom="6%"
            left="50%"
            transform="translateX(-50%)"
            zIndex={10}
            bg="rgba(0,0,0,0.2)"
            backdropFilter="blur(6px)"
            borderRadius="lg"
            px={4}
            py={2}
            boxShadow="lg">
            <MapToolButtons
              currentMapTool={currentMapTool}
              setCurrentMapTool={setCurrentMapTool}
            />
          </Box>
            <MapToolCards currentMapTool={currentMapTool} onClose={() => {setCurrentMapTool(null)}}
          />
        </Portal>
      )}

      {zoomControlFound && (
        <Portal container={zoomRef}>
          <Box zIndex={10}>
            <HStack gap={0}>
              {!isMobile && (
                <IconButton
                  icon="switch_access_shortcut"
                  variant="ghost"
                  _hover={{ bg: 'transparent' }}
                  m={0}
                  p={0}
                  onClick={() => rotateSnappy('right')}
                  mr={-3}
                />
              )}
              <IconButton
                icon="navigation"
                variant="ghost"
                _hover={{ bg: 'transparent' }}
                onClick={() => setMapAngle(0)}
                m={0}
                p={0}
                rotate={mapOrientation + 'deg'}
                mr={-3}
              />
              {!isMobile && (
                <IconButton
                  icon="switch_access_shortcut"
                  variant="ghost"
                  _hover={{ bg: 'transparent' }}
                  transform="scale(-1,1)"
                  m={0}
                  p={0}
                  onClick={() => rotateSnappy('left')}
                />
              )}
            </HStack>
          </Box>
        </Portal>
      )}
    </>
  );
};
