import { Box, IconButton, MaterialSymbol, Tooltip, VStack } from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { t } from 'i18next';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { CSSProperties } from 'react';
import { useIsMobileScreen } from '../shared/hooks';
import {
  displayMapLegendAtom,
  displayMapLegendControlAtom,
  mapOrientationDegreesAtom,
  trackPositionAtom,
} from './atoms';
import { useMapSettings } from './mapHooks';

export const MapControlButtons = () => {
  const isMobile = useIsMobileScreen();
  const mapOrientation = useAtomValue(mapOrientationDegreesAtom);
  const setDisplayMapLegend = useSetAtom(displayMapLegendAtom);
  const displayMapLegendControl = useAtomValue(displayMapLegendControlAtom);
  const [trackPosition, setTrackPosition] = useAtom(trackPositionAtom);
  const {
    rotateSnappy,
    setMapAngle,

    setMapFullScreen,
    zoomIn,
    zoomOut,
  } = useMapSettings();

  const handleMapLocationClick = () => {
    setTrackPosition((p) => !p);
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
      {displayMapLegendControl && (
        <ControlButton
          id="map_legend"
          label={t('map.controls.symbols.label')}
          icon={'info'}
          onClick={() => {
            setDisplayMapLegend((prev) => !prev);
          }}
          displayTooltip
          variant="primary"
        />
      )}

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
      <ControlButton
        id="rotate_left"
        icon="rotate_left"
        onClick={() => rotateSnappy('left')}
        label={t('map.controls.rotateLeft.label')}
        displayTooltip
        hide={isMobile}
      />
      <ControlButton
        id="reset_orientation"
        icon="navigation"
        onClick={() => setMapAngle(0)}
        label={t('map.controls.orientation.label')}
        style={{
          transform: `rotate(${mapOrientation}deg)`,
          transition: 'none',
        }}
        displayTooltip
      />
      <ControlButton
        id="rotate_right"
        icon="rotate_right"
        onClick={() => rotateSnappy('right')}
        label={t('map.controls.rotateRight.label')}
        hide={isMobile}
        displayTooltip
      />
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
      <ControlButton
        id="fullscreen"
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
  const ph = usePostHog();
  return (
    <IconButton
      variant={props.variant || 'ghost'}
      colorPalette="green"
      size={{ base: 'sm', md: 'md' }}
      icon={props.icon}
      aria-label={props.label}
      onClick={() => {
        ph.capture('map_control_clicked', { control: props.id });
        props.onClick();
      }}
      style={props.style}
    />
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
