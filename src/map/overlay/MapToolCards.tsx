import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  VStack,
} from '@kvib/react';

import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DrawControls } from '../../draw/drawControls/DrawControls';
import { MapThemes } from '../../settings/map/themes/MapThemes';
import { useIsMobileScreen } from '../../shared/hooks';
import { SettingsDrawer } from '../../sidePanel/SettingsDrawer';
import { drawPanelCollapsedAtom, mapToolAtom } from './atoms';

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
  const [, setCollapsed] = useAtom(drawPanelCollapsedAtom);
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);

  const onClose = () => {
    setCurrentMapTool(null);
    setCollapsed(true);
  };

  if (currentMapTool === 'draw') {
    return (
      <MapToolCard label={t('draw.tabHeading')} onClose={onClose}>
        <DrawControls />
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
      maxHeight={isMobile ? '80dvh' : 'calc(100vh - 65px)'}
      pointerEvents="auto"
      bg="#FFFF"
      p={4}
      m={{ base: 0, lg: 1 }}
      mr={{ base: 0, lg: 3 }}

      borderTopLeftRadius={{ base: '0px', md: '16px' }}
      borderTopRightRadius={{ base: '0px', md: '16px' }}
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
