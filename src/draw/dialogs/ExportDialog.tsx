import {
  Dialog,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { ExportControls } from '../export/ExportControls';
import { isExportDialogOpenAtom } from './atoms';

export const ExportDialog = () => {
  const [isOpen, setIsOpen] = useAtom(isExportDialogOpenAtom);
  return (
    <Dialog
      placement={'center'}
      motionPreset="slide-in-left"
      onOpenChange={(e) => setIsOpen(e.open)}
      open={isOpen}
    >
      <DialogContent>
        <DialogBody>
          <ExportControls />
        </DialogBody>

        <DialogCloseTrigger />
      </DialogContent>
    </Dialog>
  );
};
