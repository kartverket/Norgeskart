import { DrawerContent } from '@chakra-ui/react';
import { Drawer, DrawerPositioner, useBreakpointValue } from '@kvib/react';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { displayMapLegendAtom } from '../../atoms';
import { activeThemeLayersAtom } from '../../layers/atoms';
import { MapLegend } from '../../legend/MapLegend';

export const MapLegendDrawer = () => {
  const [isOpen, setIsOpen] = useAtom(displayMapLegendAtom);
  const [activeLayers] = useAtom(activeThemeLayersAtom);
  const isSmallScreen = useBreakpointValue({
    base: true,
    lg: false,
  });

  useEffect(() => {
    if (isOpen && activeLayers.size === 0) {
      setIsOpen(false);
    }
  }, [activeLayers, isOpen, setIsOpen]);

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
