import { 
  Button,
  HStack,
  Icon,
  MaterialSymbol,
  Text,
  toaster,
  VStack
} from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { t } from 'i18next';
import { useAtom } from 'jotai';
import { useIsMobileScreen } from '../../shared/hooks';
import { mapToolAtom } from './atoms';

// MapButton component
interface MapButtonProps {
  onClick: () => void;
  icon: MaterialSymbol;
  label: string;
}

const MapButton = ({ onClick, icon, label }: MapButtonProps) => {
  return (
    <Button onClick={onClick} variant="ghost" colorPalette="green" pt={8} pb={8}>
      <VStack>
        <Icon icon={icon} />
        <Text fontSize="sm" fontWeight="medium">{label}</Text>
      </VStack>
    </Button>
  );
};

// MapToolButtons component
export const MapToolButtons = () => {
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);
  const isMobileScreen = useIsMobileScreen();
  const posthog = usePostHog();

  const handleShareMapClick = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toaster.create({ title: t('search.actions.shareMap.success'), duration: 2000 });
    });
  };

  return (
    <HStack align="flex-end">
      <MapButton
        onClick={() => {
          posthog.capture('map_draw_button_clicked');
          setCurrentMapTool(currentMapTool === 'draw' ? null : 'draw');
        }}
        icon={currentMapTool === 'draw' ? 'close' : 'edit'}
        label={currentMapTool === 'draw' ? t('draw.close') : t('draw.tabHeading')}
      />
      <MapButton
        onClick={() => setCurrentMapTool(currentMapTool === 'layers' ? null : 'layers')}
        icon={currentMapTool === 'layers' ? 'close' : 'layers'}
        label={currentMapTool === 'layers' ? t('draw.close') : t('controller.maplayers.openText')}
      />
      <MapButton
        onClick={() => setCurrentMapTool(currentMapTool === 'settings' ? null : 'settings')}
        icon={currentMapTool === 'settings' ? 'close' : 'settings'}
        label={currentMapTool === 'settings' ? t('shared.close') : t('controller.settings.text')}
      />
      <MapButton onClick={handleShareMapClick} icon={'share'} label={t('search.actions.shareMap.tooltip')} />
      {!isMobileScreen && (
      <MapButton
        onClick={() => {
          setCurrentMapTool(currentMapTool === 'print' ? null : 'print');
        }}
        icon={currentMapTool === 'print' ? 'close' : 'print'}
        label={t('controller.print.text')}
      />
      )}
    </HStack>
  );
};
