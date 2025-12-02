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
      bg={'white'}
      borderRadius={{ md: 'lg' }}
      p={2}
      pointerEvents={'all'}
    >
      <MapButton
        onClick={() => {
          posthog.capture('map_draw_button_clicked');
          setCurrentMapTool(currentMapTool === 'draw' ? null : 'draw');
        }}
        icon={'edit'}
        label={t('draw.tabHeading')}
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
      onClick={onClick}
      variant="ghost"
      colorPalette="green"
      pt={8}
      pb={8}
      backgroundColor={active ? '#D0ECD6' : ''}
    >
      <VStack>
        <Icon icon={icon} />
        <Text fontSize="sm" fontWeight="medium">
          {label}
        </Text>
      </VStack>
    </Button>
  );
};
