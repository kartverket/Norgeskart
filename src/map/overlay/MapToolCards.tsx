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
      <MapToolCard label={t('mapLayers.label')} onClose={onClose}>
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
      top={0}
      left={0}
      width="350px"
      height="100vh" // tar hele høyden
      zIndex={2000}
      pointerEvents="auto"
      bg="white"
      shadow="lg"
      overflowY="auto" // scroll hvis innholdet blir for høyt
      display="flex"
      flexDirection="column"
      borderRight="1px solid rgba(0,0,0,0.1)"
      px={4}
      py={4}
    >
      <Flex justify="space-between">
        <Heading fontWeight="bold" mb="2rem">
          {label}
        </Heading>
        <IconButton
          icon="close"
          aria-label="Lukk"
          colorPalette="red"
          onClick={() => {
            onClose();
          }}
          size="sm"
        />
      </Flex>
      <Box>{children}</Box>
    </Box>
  );
};
