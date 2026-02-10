import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  VStack,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { MapTool } from '../../Layout';
import { useDrawSettings } from '../../draw/drawControls/hooks/drawSettings';
import { DrawSettings } from '../../settings/draw/DrawSettings';
import { MapThemes } from '../../settings/map/MapThemes';
import { useIsMobileScreen } from '../../shared/hooks';
import { InfoDrawer } from '../../sidePanel/InfoDrawer';
import { SettingsDrawer } from '../../sidePanel/SettingsDrawer';
import { drawPanelCollapsedAtom } from './atoms';

export const MapToolCards = ({
  currentMapTool,
  onClose,
}: {
  currentMapTool: MapTool;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobileScreen();
  const [, setCollapsed] = useAtom(drawPanelCollapsedAtom);
  const { drawType } = useDrawSettings();

  const drawTypeLabels: Record<string, string> = {
    Move: t('draw.controls.tool.tooltip.edit'),
    Polygon: t('draw.controls.tool.tooltip.polygon'),
    Point: t('draw.controls.tool.tooltip.point'),
    LineString: t('draw.controls.tool.tooltip.linestring'),
    Circle: t('draw.controls.tool.tooltip.circle'),
    Text: t('draw.controls.tool.tooltip.text'),
  };

  const activeToolLabel = drawType
    ? drawTypeLabels[drawType]
    : t('draw.tabHeading');

  if (currentMapTool === 'draw') {
    return (
      <MapToolCard
        label={isMobile ? activeToolLabel : t('draw.tabHeading')}
        onClose={onClose}
        hideHeader={isMobile}
        showCollapse={isMobile}
        onCollapse={() => setCollapsed(true)}
      >
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
  hideHeader?: boolean;
  showCollapse?: boolean;
  onCollapse?: () => void;
}
const MapToolCard = ({
  label,
  children,
  onClose,
  hideHeader,
  showCollapse,
  onCollapse,
}: MapToolCardProps) => {
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
      borderRadius="16px"
      borderBottomLeftRadius={{ base: '0px', md: '16px' }}
      borderBottomRightRadius={{ base: '0px', md: '16px' }}
      overflowY="auto"
    >
      <Flex justify="space-between" gap="2" w="100%" align="center">
        {!hideHeader ? (
          <Heading fontWeight="bold" mb={{ base: '0', md: '2' }} size="lg">
            {label}
          </Heading>
        ) : (
          <Box />
        )}

        <HStack>
          {showCollapse && onCollapse && (
            <Button
              variant="ghost"
              leftIcon="bottom_panel_close"
              size="sm"
              onClick={onCollapse}
            >
              Skjul verktøyline
            </Button>
          )}
          <IconButton
            variant="ghost"
            icon="close"
            aria-label="Lukk"
            colorPalette="red"
            onClick={onClose}
            size="md"
          />
        </HStack>
      </Flex>

      <Box w="100%" overflowY="auto" maxHeight="90%">
        {children}
      </Box>
    </VStack>
  );
};
