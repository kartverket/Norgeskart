import {
  Box,
  FileUploadDropzone,
  FileUploadDropzoneContent,
  FileUploadList,
  FileUploadRoot,
  useFileUploadContext,
} from '@kvib/react';
import { getDefaultStore, useAtomValue, useSetAtom } from 'jotai';
import { Feature } from 'ol';
import { GPX } from 'ol/format';
import { LineString, MultiLineString } from 'ol/geom';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../map/atoms';
import { clearProfileFilesAtom, profileLineAtom } from './atoms';
import { addFeatureToLayer } from './drawUtils';

//combine MultiLineString into one LineString
const combineMultiLineString = (multiLineString: MultiLineString) => {
  const lineStrings = multiLineString.getLineStrings();
  const coordinates = lineStrings.reduce((acc, lineString) => {
    return acc.concat(lineString.getCoordinates());
  }, [] as number[][]);
  return new LineString(coordinates);
};

export const ElevationProfileFileUpload = () => {
  const setProfileLine = useSetAtom(profileLineAtom);

  return (
    <FileUploadRoot
      maxFiles={1}
      accept={{ '': ['.gpx'] }}
      w={'100%'}
      onFileChange={(e) => {
        if (e.acceptedFiles.length === 0 && e.rejectedFiles.length === 0) {
          setProfileLine(null);
          return;
        }
        if (e.acceptedFiles.length === 0 && e.rejectedFiles.length > 0) {
          setProfileLine(null);
          return;
        }

        const file = e.acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const store = getDefaultStore();
          const projection = store
            .get(mapAtom)
            .getView()
            .getProjection()
            .getCode();

          const text = event.target?.result;
          const gpx = new GPX();

          const features = gpx.readFeatures(text as string, {
            dataProjection: 'EPSG:4326',
            featureProjection: projection,
          });
          if (features.length === 0) {
            setProfileLine(null);
            return;
          }
          if (features.length > 0) {
            const feature = features[0];
            const geometry = feature.getGeometry();
            if (!geometry) {
              setProfileLine(null);
              return;
            }

            if (geometry instanceof LineString) {
              addFeatureToLayer(new Feature(geometry));
            } else if (geometry instanceof MultiLineString) {
              const combinedLineString = combineMultiLineString(geometry);
              addFeatureToLayer(new Feature(combinedLineString));
            } else {
              setProfileLine(null);
            }
          }
        };
        reader.readAsText(file);
      }}
    >
      <FileUploadDropZoneContainer />
      <FileUploadList clearable />
    </FileUploadRoot>
  );
};

const FileUploadDropZoneContainer = () => {
  const { t } = useTranslation();
  const profileLine = useAtomValue(profileLineAtom);
  const setClearProfileFiles = useSetAtom(clearProfileFilesAtom);
  if (profileLine !== null) {
    return null;
  }
  const fileUploadContext = useFileUploadContext();
  setClearProfileFiles(() => () => {
    fileUploadContext.clearFiles();
  });

  return (
    <FileUploadDropzone label={undefined} w={'100%'}>
      <FileUploadDropzoneContent w={'100%'} gap={2}>
        <Box>{t('printdialog.elevationProfile.fileUpload.dragDrop.label')}</Box>
        <Box color="fg.muted">
          {t('printdialog.elevationProfile.fileUpload.dragDrop.fileInfo')}
        </Box>
      </FileUploadDropzoneContent>
    </FileUploadDropzone>
  );
};
