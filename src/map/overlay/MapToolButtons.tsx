import {
  Button,
  HStack,
  Icon,
  MaterialSymbol,
  Text,
  toaster,
  VStack,
} from '@kvib/react';
import { t } from 'i18next';
import { useSetAtom } from 'jotai';
import { isRettIKartetDialogOpenAtom } from '../menu/dialogs/atoms';
import { MapTool } from './MapOverlay';

interface MapToolButtonsProps {
  currentMapTool: MapTool;
  setCurrentMapTool: (tool: MapTool) => void;
}
export const MapToolButtons = ({
  currentMapTool,
  setCurrentMapTool,
}: MapToolButtonsProps) => {
  const setRettIKartetDialogOpen = useSetAtom(isRettIKartetDialogOpenAtom);
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
    <HStack align="flex-end">
      <MapButton
        onClick={() => {
          setCurrentMapTool(currentMapTool === 'draw' ? null : 'draw');
        }}
        icon={currentMapTool == 'draw' ? 'close' : 'edit'}
        label={
          currentMapTool == 'draw' ? t('draw.close') : t('draw.tabHeading')
        }
      />
      <MapButton
        onClick={() => {
          setCurrentMapTool(currentMapTool === 'layers' ? null : 'layers');
        }}
        icon={currentMapTool == 'layers' ? 'close' : 'layers'}
        label={
          currentMapTool == 'layers'
            ? t('draw.close')
            : t('controller.maplayers.openText')
        }
      />
      <MapButton
        onClick={() => {
          setCurrentMapTool(currentMapTool === 'settings' ? null : 'settings');
        }}
        icon={currentMapTool === 'settings' ? 'close' : 'settings'}
        label={
          currentMapTool == 'settings'
            ? t('shared.close')
            : t('controller.settings.text')
        }
      />

      <MapButton
        onClick={handleShareMapClick}
        icon={'share'}
        label={t('search.actions.shareMap.tooltip')}
      />

      <MapButton
        onClick={handlePrintMapClick}
        icon={'print'}
        label={t('controller.print.text')}
      />
      <MapButton
        onClick={() => setRettIKartetDialogOpen(true)}
        icon={'edit_road'}
        label={t('map.contextmenu.items.rettikartet.label')}
      />
    </HStack>
  );
};

interface MapButtonProps {
  onClick: () => void;
  icon: MaterialSymbol;
  label: string;
}
const MapButton = ({ onClick, icon, label }: MapButtonProps) => {
  return (
    <Button onClick={onClick} variant="ghost" colorPalette="green" p={8}>
      <VStack>
        <Icon icon={icon} boxSize={6} />
        <Text fontSize="sm" fontWeight="medium">
          {label}
        </Text>
      </VStack>
    </Button>
  );
};
