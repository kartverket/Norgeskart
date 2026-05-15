import { DrawerContent } from '@chakra-ui/react';
import { Drawer, DrawerPositioner, useBreakpointValue } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { displayMapLegendAtom } from '../../atoms';
import { activeThemeLayersAtom } from '../../layers/atoms';
import {
  allConfiguredBackgroundLayers,
  backgroundLayerAtom,
} from '../../layers/config/backgroundLayers/atoms';
import { MapLegend } from '../../legend/MapLegend';

export const MapLegendDrawer = () => {
  const [isOpen, setIsOpen] = useAtom(displayMapLegendAtom);
  const [activeLayers] = useAtom(activeThemeLayersAtom);
  const backgroundLayerName = useAtomValue(backgroundLayerAtom);
  const isSmallScreen = useBreakpointValue({
    base: true,
    lg: false,
  });

  const hasBackgroundLegend = allConfiguredBackgroundLayers.some(
    (config) =>
      config.layerName === backgroundLayerName &&
      'legendUrl' in config &&
      !!config.legendUrl,
  );

  useEffect(() => {
    if (isOpen && activeLayers.size === 0 && !hasBackgroundLegend) {
      setIsOpen(false);
    }
  }, [activeLayers, hasBackgroundLegend, isOpen, setIsOpen]);

  return (
    <Drawer
      trapFocus={false}
      open={isOpen}
      onExitComplete={() => setIsOpen(false)}
      size={'xs'}
      placement={isSmallScreen ? 'top' : 'end'}
      modal={false}
      closeOnInteractOutside={false}
    >
      <DrawerPositioner pointerEvents={'none'}>
        <DrawerContent>
          <MapLegend />
        </DrawerContent>
      </DrawerPositioner>
    </Drawer>
  );
};
