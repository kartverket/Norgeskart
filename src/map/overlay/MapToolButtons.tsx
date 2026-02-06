import {
  Box,
  Button,
  HStack,
  Icon,
  MaterialSymbol,
  Text,
  toaster,
  VStack,
} from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { isPrintDialogOpenAtom } from '../../print/atoms';
import { useIsMobileScreen } from '../../shared/hooks';
import { activeThemeLayersAtom } from '../layers/atoms';
import { mapToolAtom } from './atoms';

export const MapToolButtons = () => {
  const { t } = useTranslation();
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);
  const setIsPrintDialogOpen = useSetAtom(isPrintDialogOpenAtom);
  const isMobile = useIsMobileScreen();
  const isPrintDialogOpenDisabled = useAtomValue(isPrintDialogOpenAtom);
  const posthog = usePostHog();
  const handleShareMapClick = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toaster.create({
        title: t('search.actions.shareMap.success'),
        duration: 2000,
      });
    });
  };
  const activeLayers = useAtomValue(activeThemeLayersAtom);

  return (
    <HStack
      align="flex-end"
      justify="space-between"
      overflowX={{ base: 'auto', md: 'none' }}
      bg="#FFFF"
      borderRadius={{ base: '', md: 'lg' }}
      py={{ base: 3, md: 2 }}
      px={{ base: 0, md: 2 }}
      mb={{ base: 0, md: 0 }}
      pointerEvents={'all'}
    >
      <Box position="relative">
        <MapButton
          onClick={() => {
            setCurrentMapTool(currentMapTool === 'layers' ? null : 'layers');
          }}
          icon={'layers'}
          label={
            isMobile
              ? t('controller.maplayers.mobiletext')
              : t('controller.maplayers.openText')
          }
          active={currentMapTool === 'layers'}
          id="map-layers-button"
        />
        {activeLayers.size > 0 && (
          <Text
            position={'absolute'}
            top={-1}
            right={1}
            backgroundColor={'#FFDD9D'}
            borderRadius="full"
            borderWidth={'2px'}
            borderColor={'white'}
            px={2}
            py={0.5}
            pointerEvents={'none'}
            fontSize={'sm'}
          >
            {activeLayers.size}
          </Text>
        )}
      </Box>
      <MapButton
        onClick={() => {
          posthog.capture('map_draw_button_clicked');
          setCurrentMapTool(currentMapTool === 'draw' ? null : 'draw');
        }}
        icon={'edit'}
        label={
          isMobile ? t('controller.draw.mobiletext') : t('controller.draw.text')
        }
        active={currentMapTool === 'draw'}
        disabled={isPrintDialogOpenDisabled}
        id="map-draw-button"
      />
      <MapButton
        onClick={handleShareMapClick}
        icon={'share'}
        label={
          isMobile
            ? t('controller.sharemap.mobiletext')
            : t('controller.sharemap.text')
        }
        id="map-share-button"
      />
      {!isMobile && (
        <MapButton
          onClick={() => {
            setIsPrintDialogOpen((p) => !p);
          }}
          icon={'print'}
          label={t('controller.print.text')}
          ariaLabel="print"
          id="map-print-button"
        />
      )}
      <MapButton
        onClick={() => {
          setCurrentMapTool(currentMapTool === 'info' ? null : 'info');
        }}
        icon={'help'}
        label={t('controller.help.mobiletext')}
        active={currentMapTool === 'info'}
        id="map-info-button"
      />
    </HStack>
  );
};

interface MapButtonProps {
  onClick: () => void;
  icon: MaterialSymbol;
  label: string;
  active?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  id?: string;
}
const MapButton = ({
  onClick,
  icon,
  label,
  active,
  ariaLabel,
  disabled,
  id,
}: MapButtonProps) => {
  const posthog = usePostHog();
  return (
    <Button
      disabled={disabled}
      w={'fit-content'}
      onClick={() => {
        posthog.capture('map_tool_button_clicked', { tool: id || label });
        onClick();
      }}
      variant="ghost"
      colorPalette="green"
      py={{ base: 2, md: 8 }}
      backgroundColor={active ? '#D0ECD6' : ''}
      aria-label={ariaLabel || label}
      id={id}
    >
      <VStack gap={{ base: 0, md: 1 }} align="center" justify="center">
        <Icon icon={icon} />
        <Text
          fontSize="sm"
          fontWeight="medium"
          textAlign="start"
          whiteSpace="no-wrap"
        >
          {label}
        </Text>
      </VStack>
    </Button>
  );
};
