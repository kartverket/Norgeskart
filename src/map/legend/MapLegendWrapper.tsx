import { DrawerContent } from '@chakra-ui/react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  Drawer,
  DrawerPositioner,
  useBreakpointValue,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { displayMapLegendAtom } from '../atoms';
import { MapLegend } from './MapLegend';

export const MapLegendWrapper = () => {
  const [isOpen, setIsOpen] = useAtom(displayMapLegendAtom);
  const displayAsDialog = useBreakpointValue({
    base: true,
    lg: false,
  });

  if (displayAsDialog) {
    return (
      <Dialog onOpenChange={(e) => setIsOpen(e.open)} open={isOpen} size={'lg'}>
        <DialogContent>
          <DialogBody mb={'8px'}>
            <MapLegend />
          </DialogBody>
        </DialogContent>
      </Dialog>
    );
  } else {
    return (
      <Drawer
        trapFocus={false}
        open={isOpen}
        onExitComplete={() => setIsOpen(false)}
        size={'xs'}
        placement={'end'}
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
  }
};
