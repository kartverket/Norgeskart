import { Box, IconButton, Portal, Stack, Tooltip } from '@kvib/react';
import { useEffect, useRef, useState } from 'react';
import { useMapSettings } from './mapHooks';

export const MapOverlay = () => {
  const { setMapFullScreen, setMapLocation } = useMapSettings();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const portalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setTimeout(() => {
      const portalTargetElement = document.getElementById(
        'custom-control-portal',
      );
      portalRef.current = portalTargetElement;
      setPortalTarget(portalTargetElement);
    }, 10);
  }, []);

  return (
    <>
      {portalTarget && (
        <Portal container={portalRef}>
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
          <Box position="absolute" top="16px" right="16px" zIndex={10}>
            <Stack>
              {document.fullscreenEnabled && (
                <Tooltip content={'Fullskjerm'}>
                  <IconButton
                    onClick={() => {
                      setMapFullScreen(true);
                    }}
                    variant="ghost"
                    icon={'fullscreen'}
                  />
                </Tooltip>
              )}
              <Tooltip content={'Vis min posisjon'}>
                <IconButton
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setMapLocation(
                        [pos.coords.longitude, pos.coords.latitude],
                        'EPSG:4326',
                        15,
                      );
                    });
                  }}
                  variant="ghost"
                  icon={'my_location'}
                />
              </Tooltip>
            </Stack>
          </Box>
        </Portal>
      )}
    </>
  );
};
