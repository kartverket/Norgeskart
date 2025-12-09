import {
  Button,
  HStack,
  Icon,
  MaterialSymbol,
  Text,
  toaster,
  useBreakpointValue,
  VStack,
} from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { t } from 'i18next';
import { useAtom } from 'jotai';
import { useIsMobileScreen } from '../../shared/hooks';
import { mapToolAtom } from './atoms';

export const MapToolButtons = () => {
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);
  const isMobile = useIsMobileScreen();
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
      justify="center"
      bg={{ base: 'rgba(255, 255, 255, 0.85)', md: 'white' }}
      borderRadius="lg"
      py={{base:1, md:2}}
      px={{ base: 0, md: 2 }}
      mb={{base:2, md:0}}
      pointerEvents={'all'}
    >
      <MapButton
        onClick={() => {
          posthog.capture('map_draw_button_clicked');
          setCurrentMapTool(currentMapTool === 'draw' ? null : 'draw');
        }}
        icon={'edit'}
        label={isMobile ? 'Verktøy' : t('controller.draw.text')}
        active={currentMapTool === 'draw'}
      />
      <MapButton
        onClick={() => {
          setCurrentMapTool(currentMapTool === 'layers' ? null : 'layers');
        }}
        icon={'layers'}
        label={isMobile ? 'Lag' : t('controller.maplayers.openText')}
        active={currentMapTool === 'layers'}
      />
      <MapButton
        onClick={() => {
          setCurrentMapTool(currentMapTool === 'settings' ? null : 'settings');
        }}
        icon={'settings'}
        label={isMobile ? 'Info' : t('controller.settings.text')}
        active={currentMapTool === 'settings'}
      />

      <MapButton
        onClick={handleShareMapClick}
        icon={'share'}
        label={isMobile ? 'Del' : t('search.actions.shareMap.tooltip')}
      />

      {!isMobile && (
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
  const isSmall = useBreakpointValue({ base: true, sm: false });

  return (
    <Button
      w={'fit-content'}
      onClick={onClick}
      variant="ghost"
      colorPalette="green"
      py={{base:0, md:8}}
      backgroundColor={active ? '#D0ECD6' : ''}
    >
      <VStack gap={{base:0, md:1}} align="center" justify="center">
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
