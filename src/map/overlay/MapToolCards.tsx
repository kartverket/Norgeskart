import { Box, Flex, Heading, IconButton, VStack } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { DrawSettings } from '../../settings/draw/DrawSettings';
import { MapThemes } from '../../settings/map/MapThemes';
import { InfoDrawer } from '../../sidePanel/InfoDrawer';
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
        <MapThemes />
      </MapToolCard>
    );
  }
  if (currentMapTool === 'info') {
    return (
      <MapToolCard label={t('info.settings.text')} onClose={onClose}>
        <InfoDrawer />
      </MapToolCard>
    );
  }
  if (currentMapTool === 'settings') {
    return (
      <MapToolCard label={t('info.settings.text')} onClose={onClose}>
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
    <VStack
      width="100%"
      maxWidth={{ base: '100%', md: '425px' }}
      maxHeight="100%"
      pointerEvents="auto"
      bg="#FFFF"
      shadow="lg"
      p={4}
      m={{ base: 0, md: 1 }}
      mr={{ base: 0, md: 3 }}
      borderRadius={'16px'}
      borderBottomLeftRadius={{ base: '0px', md: '16px' }}
      borderBottomRightRadius={{ base: '0px', md: '16px' }}
      overflowY={'auto'}
    >
      <Flex justify="space-between" gap="2" w={'100%'}>
        <Heading fontWeight="bold" mb={{ base: '0', md: '2' }} size={'lg'}>
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
      <Box w={'100%'} overflowY={'auto'} maxHeight={'90%'}>
        {children}
      </Box>
    </VStack>
  );
};
