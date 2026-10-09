import { Dialog, DialogContent } from '@kvib/react';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { displayMapLegendAtom } from '../../atoms';
import { activeThemeLayersAtom } from '../../layers/atoms';
import { MapLegend } from '../../legend/MapLegend';

export const MapLegendDrawer = () => {
  const [isOpen, setIsOpen] = useAtom(displayMapLegendAtom);
  const [activeLayers] = useAtom(activeThemeLayersAtom);
  useEffect(() => {
    if (isOpen && activeLayers.size === 0) {
      setIsOpen(false);
    }
  }, [activeLayers, isOpen, setIsOpen]);

  return (
    <Dialog
      placement="center"
      size="xs"
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
    >
      <DialogContent
        width="360px"
        maxW="calc(100vw - 2rem)"
        minW={0}
        maxH="90vh"
        p={0}
      >
        <MapLegend />
      </DialogContent>
    </Dialog>
  );
};
