import { Box, Flex, Heading, IconButton } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { DrawSettings } from '../../settings/draw/DrawSettings';
import { MapSettings } from '../../settings/map/MapSettings';
import { SettingsDrawer } from '../../sidePanel/SettingsDrawer';
import { MapTool } from './MapOverlay';

export const MapToolCards = ({
  currentMapTool,
  onClose,
}: {
  currentMapTool: MapTool;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  if (currentMapTool === 'draw') {
    return (
      <MapToolCard label={t('draw.tabHeading')} onClose={onClose}>
        <DrawSettings />
      </MapToolCard>
    );
  }
  if (currentMapTool === 'layers') {
    return (
      <MapToolCard label={t('mapLayers.label')} onClose={onClose}>
        <MapSettings />
      </MapToolCard>
    );
  }
  if (currentMapTool === 'settings') {
    return (
      <MapToolCard label={t('settings.label')} onClose={onClose}>
        <SettingsDrawer />
      </MapToolCard>
    );
  }
};

interface MapToolCardProps {
  label: string;
  children: React.ReactNode | React.ReactNode[] | undefined;
  onClose: () => void;
}
const MapToolCard = ({ label, children, onClose }: MapToolCardProps) => {
  return (
    <Box
      position="fixed"
      width="auto"
      bottom="0"
      left="50%"
      transform="translate(-50%)"
      zIndex={2000}
      pointerEvents="auto"
      bg="#ffff"
      shadow="lg"
      display="flex"
      flexDirection="column"
      borderRight="1px solid rgba(0,0,0,0.1)"
      p={5}
      borderTopRadius={10}
    >
      <Flex justifyContent="space-between" pb={3}>
        <Heading>{label}</Heading>
        <IconButton
          variant="ghost"
          icon="close"
          aria-label="Lukk"
          colorPalette="red"
          onClick={() => {
            onClose();
          }}
          size="md"
          p={0}
        />
      </Flex>
      <Box overflowY="auto" height={'100%'}>
        {children}
      </Box>
    </Box>
  );
};
