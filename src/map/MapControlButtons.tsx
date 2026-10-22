import { Box, Button, Icon, MaterialSymbol, Tooltip, VStack } from '@kvib/react';
import { t } from 'i18next';
import { useAtom } from 'jotai';
import { CSSProperties } from 'react';
// import { MeasurePopover } from '../measure/MeasurePopover';
import { useIsMobileScreen } from '../shared/hooks';
import { trackPositionAtom } from './geolocation/atoms';
import { useMapSettings } from './mapHooks';
// import { MapOrientationControl } from './MapOrientationControl';

export const MapControlButtons = () => {
  const isMobile = useIsMobileScreen();
  const [trackPosition, setTrackPosition] = useAtom(trackPositionAtom);
  const { zoomIn, zoomOut } = useMapSettings();
  // const { setMapFullScreen, zoomIn, zoomOut } = useMapSettings();

  const handleMapLocationClick = () => {
    setTrackPosition((p) => !p);
  };

  /*
  /*
  const handleFullScreenClick = () => {
    if (document.fullscreenElement) {
      setMapFullScreen(false);
    } else {
      setMapFullScreen(true);
    }
  };
  */

  return (
    <VStack
      bg="#FFFF"
      borderRadius="4px"
      alignItems="center"
      w={{ base: '8', md: '10' }}
      pointerEvents="auto"
      py={1}
      shadow="lg"
    >
      <ControlButton
        id="zoom_in"
        icon="add"
        onClick={zoomIn}
        label={t('map.controls.zoomIn.label')}
        hide={isMobile}
      />
      <ControlButton
        id="zoom_out"
        icon="remove"
        onClick={zoomOut}
        label={t('map.controls.zoomOut.label')}
        hide={isMobile}
      />
      {/* {!isMobile && <MeasurePopover />} */}
      {navigator.geolocation && (
        <ControlButton
          id={trackPosition ? 'location_disabled' : 'location_enabled'}
          icon={trackPosition ? 'location_disabled' : 'my_location'}
          onClick={handleMapLocationClick}
          label={
            trackPosition
              ? t('map.controls.myLocation.disable.label')
              : t('map.controls.myLocation.enable.label')
          }
          displayTooltip
        />
      )}
      {/*
      {/*
      <ControlButton
        id="fullscreen"
        icon="fullscreen"
        onClick={handleFullScreenClick}
        label={t('map.controls.fullscreen.label')}
        displayTooltip
        hide={isMobile}
      />
      <MapOrientationControl />
      */}
    </VStack>
  );
};

interface ControlButtonProps {
  id: string;
  label: string;
  icon: MaterialSymbol;
  onClick: () => void;
  displayTooltip?: boolean;
  style?: CSSProperties;
  hide?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'tertiary';
}

const ControlIconButton = (props: ControlButtonProps) => {
  return (
    <Button
      variant={props.variant || 'ghost'}
      colorPalette="green"
      size="sm"
      _hover={{ backgroundColor: 'green.50' }}
      aria-label={props.label}
      onClick={() => {
        props.onClick();
      }}
      style={props.style}
    >
      <Icon icon={props.icon} />
    </Button>
  );
};
const ControlButton = (props: ControlButtonProps) => {
  if (props.hide) {
    return null;
  }

  if (!props.displayTooltip) {
    return <ControlIconButton {...props} />;
  }

  return (
    <Tooltip
      content={props.label}
      portalled={false}
      positioning={{ placement: 'left' }}
    >
      {/* Box here to render the tooltip */}
      <Box>
        <ControlIconButton {...props} />
      </Box>
    </Tooltip>
  );
};
