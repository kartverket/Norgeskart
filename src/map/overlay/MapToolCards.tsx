import { Box, Flex, Heading, IconButton, VStack } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { DrawSettings } from '../../settings/draw/DrawSettings';
import { MapSettings } from '../../settings/map/MapSettings';
import { InfoDrawer } from '../../sidePanel/InfoDrawer';
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
        <InfoDrawer />
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
    <VStack
      width={{ base: '100%', md: '450px' }}
      pointerEvents="auto"
      bg="#FFFF"
      shadow="lg"
      borderRight="1px solid rgba(0,0,0,0.1)"
      px={8}
      py={4}
      m={{ base: 0, md: 1, lg: 4 }}
      borderRadius={'16px'}
      borderBottomLeftRadius={{ base: '0px', md: '16px' }}
      borderBottomRightRadius={{ base: '0px', md: '16px' }}
      maxHeight={{ base: '65vh', md: '55vh' }}
    >
      <Flex justify="space-between" gap="2" w={'100%'}>
        <Heading fontWeight="bold" mb={{ base: '0', md: '2' }}>
          {label}
        </Heading>
        <IconButton
          variant="ghost"
          icon="close"
          aria-label="Lukk"
          colorPalette="red"
          onClick={() => {
            onClose();
          }}
          size="sm"
        />
      </Flex>
      <Box overflowY="auto" height={'100%'} w={'100%'}>
        {children}
      </Box>
    </VStack>
  );
};
