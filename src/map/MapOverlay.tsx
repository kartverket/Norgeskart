import {
  Box,
  Card,
  CardBody,
  CardHeader,
  HStack,
  IconButton,
  Image,
  Portal,
  Stack,
  Tooltip,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DrawSettings } from '../settings/draw/DrawSettings';
import { MapSettings } from '../settings/map/MapSettings';
import {
  displayCompassOverlayAtom,
  magneticDeclinationAtom,
  mapOrientationDegreesAtom,
  useMagneticNorthAtom,
} from './atoms';
import { useCompassFileName, useMapSettings } from './mapHooks';

export const MapOverlay = () => {
  const { setMapFullScreen, setMapLocation, setMapAngle, rotateSnappy } =
    useMapSettings();
  const mapOrientation = useAtomValue(mapOrientationDegreesAtom);
  const magneticDeclination = useAtomValue(magneticDeclinationAtom);
  const useMagneticNorth = useAtomValue(useMagneticNorthAtom);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const portalRef = useRef<HTMLElement>(null);
  const [zoomControl, setZoomControl] = useState<HTMLElement | null>(null);
  const zoomRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  const displayCompassOverlay = useAtomValue(displayCompassOverlayAtom);
  const compassFileName = useCompassFileName();

  const compassOrientation =
    mapOrientation + (useMagneticNorth ? magneticDeclination : 0);

  useEffect(() => {
    setTimeout(() => {
      const portalTargetElement = document.getElementById(
        'custom-control-portal',
      );
      portalRef.current = portalTargetElement;
      setPortalTarget(portalTargetElement);
    }, 10);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const olZoomControlElement = document.getElementsByClassName(
        'ol-zoom',
      )[0] as HTMLElement;
      zoomRef.current = olZoomControlElement;
      setZoomControl(olZoomControlElement);
    }, 10);
  });

  const [showDrawSettings, setShowDrawSettings] = useState(false);
  const [showMapSettings, setShowMapSettings] = useState(false);

  // Hjelpefunksjon for å lukke det andre panelet når et åpnes (valgfritt)
  const toggleDrawSettings = () => {
    setShowDrawSettings((prev) => !prev);
    if (!showDrawSettings) setShowMapSettings(false);
  };

  const toggleMapSettings = () => {
    setShowMapSettings((prev) => !prev);
    if (!showMapSettings) setShowDrawSettings(false);
  };

  return (
    <>
      {portalTarget && (
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

          {/* Her er hovedboksen for knappene øverst til høyre */}
          <Box position="absolute" top="16px" right="16px" zIndex={10}>
            <Stack align="flex-end">
              {document.fullscreenEnabled && (
                <Tooltip content={t('map.overlay.fullscreen')}>
                  <IconButton
                    onClick={() => setMapFullScreen(true)}
                    variant="solid"
                    icon="fullscreen"
                  />
                </Tooltip>
              )}

              <Tooltip content={t('map.overlay.myPosition')}>
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
                  variant="solid"
                  icon="my_location"
                />
              </Tooltip>

              <Tooltip
                content={
                  showDrawSettings ? t('draw.close') : t('draw.tabHeading')
                }
              >
                <IconButton
                  onClick={toggleDrawSettings}
                  variant="solid"
                  icon="edit"
                />
              </Tooltip>

              <Tooltip
                content={
                  showMapSettings ? t('mapLayers.close') : t('mapLayers.open')
                }
              >
                <IconButton
                  onClick={toggleMapSettings}
                  variant="solid"
                  icon="layers"
                />
              </Tooltip>
            </Stack>

            {/* Tegneverktøy-panelet, vises under knappene */}
            {showDrawSettings && (
              <Box mt={5} width="350px">
                <Card opacity={.9} borderRadius="lg">
                  <CardHeader fontWeight="bold">
                    {t('draw.tabHeading')}
                  </CardHeader>
                  <CardBody>
                    <DrawSettings />
                  </CardBody>
                </Card>
              </Box>
            )}

            {/* Kartinnstillinger-panelet, også under knappene */}
            {showMapSettings && (
              <Box mt={5} width="350px" boxShadow="lg" borderRadius="md">
                <Card>
                  <CardHeader fontWeight="bold">
                    {t('mapLayers.label')}
                  </CardHeader>
                  <CardBody>
                    <MapSettings />
                  </CardBody>
                </Card>
              </Box>
            )}
          </Box>
        </Portal>
      )}

      {zoomControl && (
        <Portal container={zoomRef}>
          <Box zIndex={10}>
            <HStack gap={0}>
              <IconButton
                icon="switch_access_shortcut"
                variant="ghost"
                _hover={{ bg: 'transparent' }}
                m={0}
                p={0}
                onClick={() => rotateSnappy('right')}
                mr={-3}
              />
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
              <IconButton
                icon="switch_access_shortcut"
                variant="ghost"
                _hover={{ bg: 'transparent' }}
                transform="scale(-1,1)"
                m={0}
                p={0}
                onClick={() => rotateSnappy('left')}
              />
            </HStack>
          </Box>
        </Portal>
      )}
    </>
  );
};
