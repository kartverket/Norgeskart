import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Text,
  Tooltip,
  VStack,
} from '@kvib/react';

import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DrawControls } from '../../draw/drawControls/DrawControls';
import { useDrawSettings } from '../../draw/drawControls/hooks/drawSettings';
import { MapThemes } from '../../settings/map/themes/MapThemes';
import { useIsMobileScreen } from '../../shared/hooks';
import { InfoDrawer } from '../../sidePanel/InfoDrawer';
import { SettingsDrawer } from '../../sidePanel/SettingsDrawer';
import { activeThemeLayersAtom } from '../layers/atoms';
import { drawPanelCollapsedAtom, mapToolAtom } from './atoms';

const MapLayersCardHeader = () => {
  const { t } = useTranslation();
  const [activeThemeLayers, setActiveThemeLayers] = useAtom(
    activeThemeLayersAtom,
  );
  return (
    <HStack mb={{ base: '0', md: '2' }} h={6}>
      <Heading fontWeight="bold" size="md">
        {t('mapLayers.label')}
      </Heading>
      {activeThemeLayers.size > 0 && (
        <HStack gap={0.5}>
          <Text
            backgroundColor={'#FFDD9D'}
            borderRadius="full"
            borderWidth={'2px'}
            borderColor={'white'}
            px={2}
            py={0.5}
            pointerEvents={'none'}
            fontSize={'sm'}
          >
            {activeThemeLayers.size}
          </Text>
          <Tooltip content={t('map.settings.layers.theme.resetbutton.text')}>
            <IconButton
              variant="tertiary"
              colorPalette={'red'}
              size={'md'}
              visibility={activeThemeLayers.size > 0 ? 'visible' : 'hidden'}
              onClick={() => {
                setActiveThemeLayers(new Set());
              }}
              icon={'playlist_remove'}
            />
          </Tooltip>
        </HStack>
      )}
    </HStack>
  );
};

const MapToolCardHeader = ({ label }: { label: string | React.ReactNode }) => {
  const isLabelString = typeof label === 'string';
  return isLabelString ? (
    <Heading
      fontWeight="bold"
      mb={{ base: '0', md: '2' }}
      size={{ base: 'sm', md: 'md' }}
    >
      {label}
    </Heading>
  ) : (
    <>{label}</>
  );
};

export const MapToolCards = () => {
  const currentMapTool = useAtomValue(mapToolAtom);
  const [collapsed, setCollapsed] = useAtom(drawPanelCollapsedAtom);
  useEffect(() => {
    if (currentMapTool !== 'draw') {
      setCollapsed(false);
    }
  }, [currentMapTool, setCollapsed]);
  return (
    <Box
      display={currentMapTool === 'draw' && collapsed ? 'none' : 'block'}
      pointerEvents={'none'}
      w="100%"
    >
      <MapToolCardsBody />
    </Box>
  );
};
const MapToolCardsBody = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobileScreen();
  const [, setCollapsed] = useAtom(drawPanelCollapsedAtom);
  const { drawType } = useDrawSettings();
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);

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

  const onClose = () => {
    setCurrentMapTool(null);
    setCollapsed(true);
  };

  if (currentMapTool === 'draw') {
    return (
      <MapToolCard
        label={isMobile ? activeToolLabel : t('draw.tabHeading')}
        onClose={onClose}
        showCollapse={isMobile}
        onCollapse={() => setCollapsed(true)}
      >
        <DrawControls />
      </MapToolCard>
    );
  }
  if (currentMapTool === 'layers') {
    return (
      <MapToolCard label={<MapLayersCardHeader />} onClose={onClose}>
        <MapThemes />
      </MapToolCard>
    );
  }
  if (currentMapTool === 'info') {
    return (
      <MapToolCard label={t('controller.help.mobiletext')} onClose={onClose}>
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
  label: string | React.ReactNode;
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
  const { t } = useTranslation();
  const isMobile = useIsMobileScreen();

  return (
    <VStack
      width="100%"
      maxWidth={{ base: '100%', md: '345px' }}
      maxHeight={isMobile ? '80dvh' : 'calc(100vh - 65px)'}
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
        {!hideHeader ? <MapToolCardHeader label={label} /> : <Box />}

        <HStack>
          {showCollapse && onCollapse && (
            <Button
              variant="ghost"
              leftIcon="bottom_panel_close"
              size="sm"
              onClick={onCollapse}
            >
              {t('controller.hide')}
            </Button>
          )}
          <IconButton
            variant="ghost"
            icon="close"
            aria-label="Lukk"
            colorPalette="red"
            onClick={onClose}
            size={{ base: 'xs', md: 'sm' }}
          />
        </HStack>
      </Flex>

      <Box w="100%" overflowY="auto" maxHeight="90%">
        {children}
      </Box>
    </VStack>
  );
};
