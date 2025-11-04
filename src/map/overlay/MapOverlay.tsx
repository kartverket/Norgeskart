import { Box, Image, Portal } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useDrawSettings } from '../../draw/drawControls/hooks/drawSettings';
import {
  displayCompassOverlayAtom,
  magneticDeclinationAtom,
  mapOrientationDegreesAtom,
  useMagneticNorthAtom,
} from '../atoms';
import { MapControlButtons } from '../MapControlButtons';
import { useCompassFileName } from '../mapHooks';
import { mapToolAtom } from './atoms';
import { MapToolButtons } from './MapToolButtons';
import { MapToolCards } from './MapToolCards';

export type MapTool = 'layers' | 'draw' | 'settings' | null;

export const MapOverlay = () => {
  const mapOrientation = useAtomValue(mapOrientationDegreesAtom);
  const magneticDeclination = useAtomValue(magneticDeclinationAtom);
  const useMagneticNorth = useAtomValue(useMagneticNorthAtom);
  const [portalTargetFound, setPortalTargetFound] = useState<boolean>(false);
  const portalRef = useRef<HTMLElement>(null);
  const [zoomControlFound, setZoomControlFound] = useState<boolean>(false);
  const zoomRef = useRef<HTMLElement>(null);
  const displayCompassOverlay = useAtomValue(displayCompassOverlayAtom);
  const compassFileName = useCompassFileName();
  const { drawEnabled, setDrawEnabled } = useDrawSettings();
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);

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
          <Box
            position="absolute"
            bottom="6%"
            left="50%"
            transform="translateX(-50%)"
            zIndex={10}
            bg="#FFFF"
            borderRadius="lg"
            p={2}
            boxShadow="lg"
          >
            <MapToolButtons
              currentMapTool={currentMapTool}
              setCurrentMapTool={setCurrentMapTool}
            />
          </Box>
          <MapToolCards
            currentMapTool={currentMapTool}
            onClose={() => {
              setCurrentMapTool(null);
            }}
          />
        </Portal>
      )}

      {zoomControlFound && (
        <Portal container={zoomRef}>
          <MapControlButtons />
        </Portal>
      )}
    </>
  );
};
