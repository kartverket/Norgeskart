import {
  HStack,
  IconButton,
  MaterialSymbol,
  toaster,
  Tooltip,
} from '@kvib/react';
import { t } from 'i18next';
import { useMapSettings } from '../mapHooks';
import { MapTool } from './MapOverlay';

interface MapToolButtonsProps {
  currentMapTool: MapTool;
  setCurrentMapTool: (tool: MapTool) => void;
}
export const MapToolButtons = ({
  currentMapTool,
  setCurrentMapTool,
}: MapToolButtonsProps) => {
  const { setMapFullScreen, setMapLocation } = useMapSettings();

  const handleMapLocationClick = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setMapLocation(
        [pos.coords.longitude, pos.coords.latitude],
        'EPSG:4326',
        15,
      );
    });
  };

  const handleShareMapClick = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toaster.create({
        title: t('search.actions.shareMap.success'),
        duration: 2000,
      });
    });
  };

  const handlePrintMapClick = () => {
    window.print();
  };

  return (
    <HStack align="flex-end">
      {document.fullscreenEnabled && (
        <MapButton
          onClick={() => setMapFullScreen(true)}
          icon="fullscreen"
          tooltip={t('map.overlay.fullscreen')}
        />
      )}

      <MapButton
        onClick={handleMapLocationClick}
        icon="my_location"
        tooltip={t('map.overlay.myPosition')}
      />

      <MapButton
        onClick={() => {
          setCurrentMapTool(currentMapTool === 'draw' ? null : 'draw');
        }}
        icon={currentMapTool == 'draw' ? 'close' : 'edit'}
        tooltip={
          currentMapTool == 'draw' ? t('draw.close') : t('draw.tabHeading')
        }
      />
      <MapButton
        onClick={() => {
          setCurrentMapTool(currentMapTool === 'layers' ? null : 'layers');
        }}
        icon={currentMapTool == 'layers' ? 'close' : 'layers'}
        tooltip={
          currentMapTool == 'layers'
            ? t('mapLayers.close')
            : t('mapLayers.open')
        }
      />
      <MapButton
        onClick={() => {
          setCurrentMapTool(currentMapTool === 'settings' ? null : 'settings');
        }}
        icon={currentMapTool === 'settings' ? 'close' : 'settings'}
        tooltip={
          currentMapTool == 'settings' ? t('shared.close') : t('shared.open')
        }
      />

      <MapButton
        onClick={handleShareMapClick}
        icon={'share'}
        tooltip={t('search.actions.shareMap.tooltip')}
      />

      <MapButton
        onClick={handlePrintMapClick}
        icon={'print'}
        tooltip={t('search.actions.print')}
      />
    </HStack>
  );
};

interface MapButtonProps {
  onClick: () => void;
  icon: MaterialSymbol;
  tooltip: string;
}
const MapButton = ({ onClick, icon, tooltip }: MapButtonProps) => {
  return (
    <Tooltip content={tooltip}>
      <IconButton onClick={onClick} variant="solid" icon={icon} size="sm" />
    </Tooltip>
  );
};
