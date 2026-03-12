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
  toaster,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { Feature } from 'ol';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDrawLayer } from '../../drawControls/hooks/mapLayers';
import { isImportDialogOpenAtom } from '../atoms';
import {
  FeatureReadResult,
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
              let readResult: FeatureReadResult;

              switch (fileExtension) {
                case 'gpx': {
                  readResult = readFeaturesFromGPXString(fileText);
                  break;
                }
                case 'geojson': {
                  readResult = readFeaturesFromGeoJsonString(fileText);

                  break;
                }
                case 'gml': {
                  readResult = readFeaturesFromGMLString(fileText);
                  break;
                }
                default:
                  toaster.error({
                    title: t('importDialog.fileTypeNotSupported'),
                  });
                  setImportedFeatures(null);
                  console.warn('unsupported file type');
                  return;
              }

              if (readResult.status === 'error') {
                toaster.error({
                  title: t('importDialog.fileReadError'),
                });
                setImportedFeatures(null);
                console.warn('error reading features from file');
                return;
              }

              const features = readResult.features;
              if (features.length === 0) {
                toaster.warning({
                  title: t('importDialog.noFeaturesFound'),
                });
                setImportedFeatures(null);
                console.warn('no features found in file');
                return;
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
