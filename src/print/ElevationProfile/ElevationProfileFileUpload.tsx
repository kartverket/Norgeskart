import {
  Box,
  FileUploadDropzone,
  FileUploadDropzoneContent,
  FileUploadList,
  FileUploadRoot,
  useFileUpload,
} from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { getDefaultStore, useSetAtom } from 'jotai';
import { Feature } from 'ol';
import { GPX } from 'ol/format';
import { LineString, MultiLineString } from 'ol/geom';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../map/atoms';
import { profileLineAtom } from './atoms';
import {
  addDrawInteractionToMap,
  addFeatureToLayer,
  removeDrawInteractionFromMap,
} from './drawUtils';

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
  const { t } = useTranslation();
  const ph = usePostHog();

  const fileUpload = useFileUpload({
    maxFiles: 1,
    maxFileSize: 3000,
    accept: { '': ['.gpx'] },
  });
  return (
    <FileUploadRoot
      maxFiles={1}
      accept={{ '': ['.gpx'] }}
      w={'100%'}
      onFileChange={(e) => {
        if (e.acceptedFiles.length !== 0) {
          addDrawInteractionToMap(() =>
            ph.capture('print_elevation_profile_generate_started'),
          );
        }

        removeDrawInteractionFromMap();
        if (e.acceptedFiles.length !== 1) {
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
      <FileUploadList
        clearable
        onChange={(e) => {
          console.log(e);
        }}
        onEmptied={(e) => {
          console.log(e);
        }}
      />
    </FileUploadRoot>
  );
};
