import {
  Button,
  Dialog,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  HStack,
  SwitchControl,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
  Text,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isImportDialogOpenAtom } from './atoms';

export const ImportDialog = () => {
  const [isOpen, setIsOpen] = useAtom(isImportDialogOpenAtom);
  const [overWriteDrawLayer, setOverWriteDrawLayer] = useState(false);
  const { t } = useTranslation();
  return (
    <Dialog
      placement={'center'}
      motionPreset="slide-in-left"
      onOpenChange={(e) => setIsOpen(e.open)}
      open={isOpen}
    >
      <DialogContent userSelect={'none'}>
        <DialogHeader>{t('importDialog.header')}</DialogHeader>
        <DialogCloseTrigger />
        <DialogBody>
          <Text> {t('importDialog.body.text')}</Text>
        </DialogBody>
        <DialogFooter>
          <HStack justify={'space-between'} w={'100%'}>
            <SwitchRoot
              onCheckedChange={(e) => setOverWriteDrawLayer(e.checked)}
              checked={overWriteDrawLayer}
            >
              <SwitchHiddenInput />
              <SwitchControl />
              <SwitchLabel>
                {t('importDialog.overwriteSwitch.label')}
              </SwitchLabel>
            </SwitchRoot>
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              {t('importDialog.buttons.confirm.label')}
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
