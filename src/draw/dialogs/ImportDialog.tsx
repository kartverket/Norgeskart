import {
  Button,
  Dialog,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FileUploadDropzone,
  FileUploadList,
  FileUploadRoot,
  HStack,
  SwitchControl,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
  Text,
} from '@kvib/react';
import { getDefaultStore, useAtom } from 'jotai';
import { GPX } from 'ol/format';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../map/atoms';
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
          <FileUploadRoot
            maxFiles={1}
            accept={{ '': ['.gpx', '.geojson', 'gml'] }}
            onFileChange={(e) => {
              const file = e.acceptedFiles[0];
              const reader = new FileReader();
              reader.onload = (event) => {
                const store = getDefaultStore();
                const projection = store
                  .get(mapAtom)
                  .getView()
                  .getProjection()
                  .getCode();
                console.log(event.type);

                const text = event.target?.result;
                const gpx = new GPX();

                const features = gpx.readFeatures(text as string, {
                  dataProjection: 'EPSG:4326',
                  featureProjection: projection,
                });
              };
              reader.readAsText(file);
            }}
          >
            <FileUploadDropzone
              label={t(
                'printdialog.elevationProfile.fileUpload.dragDrop.label',
              )}
              w={'100%'}
              minH={'unset'}
            />
            <FileUploadList clearable />
          </FileUploadRoot>
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
