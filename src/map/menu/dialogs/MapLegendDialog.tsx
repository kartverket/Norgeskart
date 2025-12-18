import { Dialog, DialogBody, DialogContent } from '@kvib/react';
import { useAtom } from 'jotai';
import { displayMapLegendAtom } from '../../atoms';
import { MapLegend } from '../../legend/MapLegend';

export const MapLegendDialog = () => {
  const [isOpen, setIsOpen] = useAtom(displayMapLegendAtom);

  return (
    <Dialog onOpenChange={(e) => setIsOpen(e.open)} open={isOpen} size={'lg'}>
      <DialogContent>
        <DialogBody mb={'8px'}>
          <MapLegend />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
