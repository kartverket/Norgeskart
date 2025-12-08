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
import { t } from 'i18next';
import { useAtom } from 'jotai';
import { useIsMobileScreen } from '../../shared/hooks';
import { mapToolAtom } from './atoms';

export const MapToolButtons = () => {
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);
  const isMobileScreen = useIsMobileScreen();
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

  const handlePrintMapClick = () => {
    window.print();
  };

  return (
    <HStack
      align="flex-end"
      justify="space-around"
      bg={'white'}
      borderRadius={{ md: 'lg' }}
      py={2}
      px={{ base: 0, md: 2 }}
      pointerEvents={'all'}
    >
      <MapButton
        onClick={() => {
          posthog.capture('map_draw_button_clicked');
          setCurrentMapTool(currentMapTool === 'draw' ? null : 'draw');
        }}
        icon={'edit'}
        label={t('controller.draw.text')}
        active={currentMapTool === 'draw'}
      />
      <MapButton
        onClick={() => {
          setCurrentMapTool(currentMapTool === 'layers' ? null : 'layers');
        }}
        icon={'layers'}
        label={t('controller.maplayers.openText')}
        active={currentMapTool === 'layers'}
      />
      <MapButton
        onClick={() => {
          setCurrentMapTool(currentMapTool === 'settings' ? null : 'settings');
        }}
        icon={'settings'}
        label={t('controller.settings.text')}
        active={currentMapTool === 'settings'}
      />

      <MapButton
        onClick={handleShareMapClick}
        icon={'share'}
        label={t('search.actions.shareMap.tooltip')}
      />

      {!isMobileScreen && (
        <MapButton
          onClick={handlePrintMapClick}
          icon={'print'}
          label={t('controller.print.text')}
        />
      )}
    </HStack>
  );
};

interface MapButtonProps {
  onClick: () => void;
  icon: MaterialSymbol;
  label: string;
  active?: boolean;
}
const MapButton = ({ onClick, icon, label, active }: MapButtonProps) => {
  return (
    <Button
      w={'fit-content'}
      maxW={{ base: '25%', md: '20%' }}
      onClick={onClick}
      variant="ghost"
      colorPalette="green"
      py={8}
      backgroundColor={active ? '#D0ECD6' : ''}
    >
      <VStack gap={1} align="center" justify="center">
        <Icon icon={icon} />
        <Text
          fontSize="sm"
          fontWeight="medium"
          textAlign="center"
          whiteSpace="normal"
        >
          {label}
        </Text>
      </VStack>
    </Button>
  );
};
