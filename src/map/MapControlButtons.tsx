import { Box, IconButton } from '@kvib/react';
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

  return (
    <Box
      className="custom-controls"
      position="absolute"
      bottom="35px"
      right="16px"
      zIndex={10}
      bg="#FFFF"
      borderRadius="xl"
      px={3}
      py={2}
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      {/* Zoom */}
      <IconButton
        variant="ghost"
        colorPalette="green"
        size="lg"
        icon="add"
        aria-label="Zoom inn"
        onClick={zoomIn}
      />
      <IconButton
        variant="ghost"
        colorPalette="green"
        size="lg"
        icon="remove"
        aria-label="Zoom ut"
        onClick={zoomOut}
      />

      {/* Separator */}
      <Box w="60%" h="1px" bg="rgba(255,255,255,0.2)" my={1} />

      {/* Rotasjon */}
      {!isMobile && (
        <>
          <IconButton
            variant="ghost"
            colorPalette="green"
            size="lg"
            icon="rotate_left"
            aria-label="Roter venstre"
            onClick={() => rotateSnappy('left')}
          />
          <IconButton
            variant="ghost"
            colorPalette="green"
            size="lg"
            icon="navigation"
            aria-label="Nullstill rotasjon"
            onClick={() => setMapAngle(0)}
            style={{ transform: `rotate(${mapOrientation}deg)` }}
          />
          <IconButton
            variant="ghost"
            colorPalette="green"
            size="lg"
            icon="rotate_right"
            aria-label="Roter høyre"
            onClick={() => rotateSnappy('right')}
          />
        </>
      )}
      {/* Separator */}
      <Box w="60%" h="1px" bg="rgba(255,255,255,0.2)" my={1} />
      {/* Andre handlinger */}
      <IconButton
        variant="ghost"
        colorPalette="green"
        size="lg"
        icon="my_location"
        aria-label="Min posisjon"
        onClick={handleMapLocationClick}
      />
      <IconButton
        variant="ghost"
        colorPalette="green"
        size="lg"
        icon="fullscreen"
        aria-label="Fullskjerm"
        onClick={handleFullScreenClick}
      />
    </Box>
  );
};
