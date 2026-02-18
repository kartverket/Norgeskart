import {
  Box,
  FileUploadDropzone,
  FileUploadDropzoneContent,
  FileUploadList,
  FileUploadRoot,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';

export const ElevationProfileFileUpload = () => {
  const { t } = useTranslation();
  return (
    <FileUploadRoot maxFiles={1} accept={{ '': ['.gpx'] }} w={'100%'}>
      <FileUploadDropzone label={undefined} w={'100%'}>
        <FileUploadDropzoneContent w={'100%'} gap={2}>
          <Box>
            {t('printdialog.elevationProfile.fileUpload.dragDrop.label')}
          </Box>
          <Box color="fg.muted">
            {t('printdialog.elevationProfile.fileUpload.dragDrop.fileInfo')}
          </Box>
        </FileUploadDropzoneContent>
      </FileUploadDropzone>
      <FileUploadList clearable />
    </FileUploadRoot>
  );
};
