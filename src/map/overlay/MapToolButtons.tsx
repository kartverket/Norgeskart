import {
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

  return (
    <HStack
      align="flex-end"
      justify="space-between"
      bg="#FFFF"
      borderRadius={{ base: '', md: 'lg' }}
      py={{ base: 3, md: 2 }}
      px={{ base: 0, md: 2 }}
      mb={{ base: 0, md: 0 }}
      pointerEvents={'all'}
    >
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
      />
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
      />
      <MapButton
        onClick={() => {
          setCurrentMapTool(currentMapTool === 'info' ? null : 'info');
        }}
        icon={'info'}
        label={isMobile ? t('info.settings.base') : t('info.settings.text')}
        active={currentMapTool === 'info'}
      />

      <MapButton
        onClick={handleShareMapClick}
        icon={'share'}
        label={
          isMobile
            ? t('controller.sharemap.mobiletext')
            : t('controller.sharemap.text')
        }
      />

      {!isMobile && (
        <MapButton
          onClick={() => {
            setIsPrintDialogOpen((p) => !p);
          }}
          icon={'print'}
          label={t('controller.print.text')}
          ariaLabel="print"
        />
      )}
      <MapButton
        onClick={() => {
          setCurrentMapTool(currentMapTool === 'settings' ? null : 'settings');
        }}
        icon={'settings'}
        label={
          isMobile
            ? t('controller.settings.mobiletext')
            : t('controller.settings.text')
        }
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
}
const MapButton = ({
  onClick,
  icon,
  label,
  active,
  ariaLabel,
  disabled,
}: MapButtonProps) => {
  return (
    <Button
      disabled={disabled}
      w={'fit-content'}
      onClick={onClick}
      variant="ghost"
      colorPalette="green"
      py={{ base: 2, md: 8 }}
      backgroundColor={active ? '#D0ECD6' : ''}
      aria-label={ariaLabel || label}
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
