import { Box, IconButton, MaterialSymbol, Tooltip, VStack } from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { t } from 'i18next';
import { useAtom, useAtomValue } from 'jotai';
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
  const [displayMapLegend, setDisplayMapLegend] = useAtom(displayMapLegendAtom);
  const displayMapLegendControl = useAtomValue(displayMapLegendControlAtom);
  const [trackPosition, setTrackPosition] = useAtom(trackPositionAtom);
  const ph = usePostHog();
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
          label={t('map.controls.symbols.label')}
          icon={'info'}
          onClick={() => {
            if (!displayMapLegend) {
              ph.capture('map_legend_opened');
            }
            setDisplayMapLegend((prev) => !prev);
          }}
          displayTooltip
          variant="primary"
        />
      )}

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
        style={{
          transform: `rotate(${mapOrientation}deg)`,
          transition: 'none',
        }}
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
  variant?: 'primary' | 'secondary' | 'ghost' | 'tertiary';
}

const ControlIconButton = (props: ControlButtonProps) => {
  return (
    <IconButton
      variant={props.variant || 'ghost'}
      colorPalette="green"
      size={{ base: 'sm', md: 'md' }}
      icon={props.icon}
      aria-label={props.label}
      onClick={props.onClick}
      style={props.style}
    />
  );
};
const ControlButton = (props: ControlButtonProps) => {
  if (props.hide) {
    return null;
  }

  if (!props.displayTooltip) {
    return (
      <ControlIconButton
        label={props.label}
        style={props.style}
        icon={props.icon}
        onClick={props.onClick}
        variant={props.variant}
      />
    );
  }

  return (
    <Tooltip
      content={props.label}
      portalled={false}
      positioning={{ placement: 'left' }}
    >
      {/* Box here to render the tooltip */}
      <Box>
        <ControlIconButton
          label={props.label}
          style={props.style}
          icon={props.icon}
          onClick={props.onClick}
          variant={props.variant}
        />
      </Box>
    </Tooltip>
  );
};
