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
import { useAtom } from 'jotai';
import { Feature } from 'ol';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDrawLayer } from '../../drawControls/hooks/mapLayers';
import { isImportDialogOpenAtom } from '../atoms';
import {
  readFeaturesFromGeoJsonString,
  readFeaturesFromGMLString,
  readFeaturesFromGPXString,
} from './utls';

export const ImportDialog = () => {
  const [isOpen, setIsOpen] = useAtom(isImportDialogOpenAtom);
  const [overWriteDrawLayer, setOverWriteDrawLayer] = useState(false);
  const [importedFeatures, setImportedFeatures] = useState<Feature[] | null>(
    null,
  );
  const { t } = useTranslation();

  const handleImportClick = () => {
    console.log(importedFeatures);
    if (!importedFeatures) {
      console.warn('no features to import');
      return;
    }
    const drawLayer = getDrawLayer();
    if (!drawLayer) {
      console.warn('draw layer not found');
      return;
    }
    if (overWriteDrawLayer) {
      drawLayer.getSource()?.clear();
    }
    drawLayer.getSource()?.addFeatures(importedFeatures);
    setIsOpen(false);
  };
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
            accept={'.gpx, .geojson, .gml'}
            onFileChange={async (e) => {
              const file = e.acceptedFiles[0];
              const fileText = await file.text();
              const fileName = file.name.toLowerCase();
              const fileExtension = fileName.split('.').pop();
              const features: Feature[] = [];
              switch (fileExtension) {
                case 'gpx': {
                  const readFeatures = readFeaturesFromGPXString(fileText);
                  features.push(...readFeatures);
                  break;
                }
                case 'geojson': {
                  const readFeatures = readFeaturesFromGeoJsonString(fileText);
                  features.push(...readFeatures);
                  break;
                }
                case 'gml': {
                  const readFeatures = readFeaturesFromGMLString(fileText);
                  features.push(...readFeatures);
                  break;
                }
                default:
                  console.warn('unsupported file type');
              }
              setImportedFeatures(features);
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
              disabled={!importedFeatures || importedFeatures.length === 0}
              onClick={handleImportClick}
            >
              {t('importDialog.buttons.confirm.label')}
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
