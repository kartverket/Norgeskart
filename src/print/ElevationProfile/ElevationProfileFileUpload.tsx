import {
  Box,
  FileUploadDropzone,
  FileUploadDropzoneContent,
  FileUploadList,
  FileUploadRoot,
} from '@kvib/react';
import { getDefaultStore, useSetAtom } from 'jotai';
import { Feature } from 'ol';
import { GPX } from 'ol/format';
import { LineString, MultiLineString } from 'ol/geom';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../map/atoms';
import { profileLineAtom } from './atoms';
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
  const { t } = useTranslation();
  return (
    <FileUploadRoot
      maxFiles={1}
      accept={{ '': ['.gpx'] }}
      w={'100%'}
      onFileChange={(e) => {
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
          console.log(text);
          const gpx = new GPX();

          const features = gpx.readFeatures(text as string, {
            dataProjection: 'EPSG:4326',
            featureProjection: projection,
          });
          console.log(features);

          const points = features.filter(
            (f) => f.getGeometry()?.getType() === 'Point',
          );
          const lines = features.filter(
            (f) => f.getGeometry()?.getType() === 'LineString',
          );
          const multiLines = features.filter(
            (f) => f.getGeometry()?.getType() === 'MultiLineString',
          );

          console.log(points, lines, multiLines);
          if (features.length === 0) {
            setProfileLine(null);
            return;
          }
          console.log(features);
          if (features.length > 0) {
            const feature = features[0];
            const geometry = feature.getGeometry();
            if (!geometry) {
              setProfileLine(null);
              return;
            }

            if (geometry instanceof LineString) {
              addFeatureToLayer(new Feature(geometry));

              //setProfileLine(transformedGeometry);
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
      <FileUploadList clearable />
    </FileUploadRoot>
  );
};
