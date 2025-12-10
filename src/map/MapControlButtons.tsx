import { Box, IconButton, MaterialSymbol, Tooltip, VStack } from '@kvib/react';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import { CSSProperties } from 'react';
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
    <VStack
      bg="#FFFF"
      borderRadius="xl"
      alignItems="center"
      w={{ base: '10', md: '12' }}
      pointerEvents="auto"
      py={1}
    >
      <ControlButton
        icon="add"
        onClick={zoomIn}
        label={t('map.controls.zoomIn.label')}
        hide={isMobile}
      />
      <ControlButton
        icon="remove"
        onClick={zoomOut}
        label={t('map.controls.zoomOut.label')}
        hide={isMobile}
      />
      <ControlButton
        icon="rotate_left"
        onClick={() => rotateSnappy('left')}
        label={t('map.controls.rotateLeft.label')}
        displayTooltip
        hide={isMobile}
      />
      <ControlButton
        icon="navigation"
        onClick={() => setMapAngle(0)}
        label={t('map.controls.orientation.label')}
        style={{ transform: `rotate(${mapOrientation}deg)` }}
        displayTooltip
      />
      <ControlButton
        icon="rotate_right"
        onClick={() => rotateSnappy('right')}
        label={t('map.controls.rotateRight.label')}
        hide={isMobile}
        displayTooltip
      />
      <ControlButton
        icon="my_location"
        onClick={handleMapLocationClick}
        label={t('map.controls.myLocation.label')}
        displayTooltip
      />
      <ControlButton
        icon="fullscreen"
        onClick={handleFullScreenClick}
        label={t('map.controls.fullscreen.label')}
        displayTooltip
        hide={isMobile}
      />
    </VStack>
  );
};

interface ControlButtonProps {
  label: string;
  icon: MaterialSymbol;
  onClick: () => void;
  displayTooltip?: boolean;
  style?: CSSProperties;
  hide?: boolean;
}

const ControlButton = (props: ControlButtonProps) => {
  if (props.hide) {
    return null;
  }
  const ControlIconButton = () => {
    return (
      <IconButton
        variant="ghost"
        colorPalette="green"
        size={{ base: 'sm', md: 'md' }}
        icon={props.icon}
        aria-label={props.label}
        onClick={props.onClick}
        style={props.style}
      />
    );
  };

  if (!props.displayTooltip) {
    return <ControlIconButton />;
  }

  return (
    <Tooltip
      content={props.label}
      portalled={false}
      positioning={{ placement: 'left' }}
    >
      {/* Box here to render the tooltip */}
      <Box>
        <ControlIconButton />
      </Box>
    </Tooltip>
  );
};
