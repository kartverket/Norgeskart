import { DrawerContent } from '@chakra-ui/react';
import { Drawer, DrawerPositioner, useBreakpointValue } from '@kvib/react';
import { useAtom } from 'jotai';
import { displayMapLegendAtom } from '../../atoms';
import { MapLegend } from '../../legend/MapLegend';

export const MapLegendDrawer = () => {
  const [isOpen, setIsOpen] = useAtom(displayMapLegendAtom);
  const isSmallScreen = useBreakpointValue({
    base: true,
    lg: false,
  });
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
