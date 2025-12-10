import { IconButton, VStack } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useIsMobileScreen } from '../shared/hooks';
import { mapOrientationDegreesAtom } from './atoms';
import { useMapSettings } from './mapHooks';

export const MapControlButtons = () => {
  const isMobile = useIsMobileScreen();
  const mapOrientation = useAtomValue(mapOrientationDegreesAtom);
  const {
    rotateSnappy,
    setMapAngle,
    setMapLocation,
    setMapFullScreen,
    zoomIn,
    zoomOut,
  } = useMapSettings();

  const handleMapLocationClick = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const { longitude, latitude } = pos.coords;
      setMapLocation([longitude, latitude], 'EPSG:4326', 15);
    });
  };

  const handleFullScreenClick = () => {
    if (document.fullscreenElement) {
      setMapFullScreen(false);
    } else {
      setMapFullScreen(true);
    }
  };

  const orientationButton = (
    <IconButton
      variant="ghost"
      colorPalette="green"
      size={{ base: 'sm', md: 'md' }}
      icon="navigation"
      aria-label="Nullstill rotasjon"
      onClick={() => setMapAngle(0)}
      style={{ transform: `rotate(${mapOrientation}deg)` }}
    />
  );

  const myLocationButton = (
    <IconButton
      variant="ghost"
      colorPalette="green"
      size={{ base: 'sm', md: 'md' }}
      icon="my_location"
      aria-label="Min posisjon"
      onClick={handleMapLocationClick}
    />
  );

  return (
    <VStack
      bg="#FFFF"
      borderRadius="xl"
      alignItems="center"
      w={{ base: '10', md: '12' }}
      pointerEvents="auto"
      py={1}
    >
      {isMobile ? (
        <>
          {orientationButton}
          {myLocationButton}
        </>
      ) : (
        <>
          {/* Zoom */}
          <IconButton
            variant="ghost"
            colorPalette="green"
            size="md"
            icon="add"
            aria-label="Zoom inn"
            onClick={zoomIn}
          />
          <IconButton
            variant="ghost"
            colorPalette="green"
            size="md"
            icon="remove"
            aria-label="Zoom ut"
            onClick={zoomOut}
          />

          {/* Rotasjon */}
          <IconButton
            variant="ghost"
            colorPalette="green"
            size="md"
            icon="rotate_left"
            aria-label="Roter venstre"
            onClick={() => rotateSnappy('left')}
          />
          {orientationButton}
          <IconButton
            variant="ghost"
            colorPalette="green"
            size="md"
            icon="rotate_right"
            aria-label="Roter høyre"
            onClick={() => rotateSnappy('right')}
          />

          {/* Andre handlinger */}
          {myLocationButton}
          <IconButton
            variant="ghost"
            colorPalette="green"
            size="md"
            icon="fullscreen"
            aria-label="Fullskjerm"
            onClick={handleFullScreenClick}
          />
        </>
      )}
    </VStack>
  );
};
