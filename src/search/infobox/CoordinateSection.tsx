import { Box, Button, Stack, toaster } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { transform } from 'ol/proj';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom, ProjectionIdentifier } from '../../map/atoms';
import { ProjectionSelector } from '../../shared/Components/ProjectionSelector';

interface CoordinateInfoProps {
  lat: number;
  lon: number;
  inputCRS: ProjectionIdentifier;
}
export const CoordinateInfo = ({ lat, lon, inputCRS }: CoordinateInfoProps) => {
  const map = useAtomValue(mapAtom);
  const { t } = useTranslation();
  const currentMapProjection = map
    .getView()
    .getProjection()
    .getCode() as ProjectionIdentifier;
  const [selectedProjection, setSelectedProjection] =
    useState<ProjectionIdentifier>(
      currentMapProjection as ProjectionIdentifier,
    );

  const [x, y] = transform([lon, lat], inputCRS, selectedProjection);

  const onCopyClick = () => {
    const coordString = `${x.toFixed(2)},${y.toFixed(2)}@${selectedProjection}`;
    navigator.clipboard.writeText(coordString);
    toaster.create({
      title: t('infoBox.coordinateSection.copy.toast.title'),
      duration: 2000,
    });
  };

  return (
    <Stack>
      <ProjectionSelector
        default={currentMapProjection}
        onProjectionChange={setSelectedProjection}
        label={t('infoBox.coordinateSection.differentCrs')}
      />
      <Stack>
        <Box>{`${x.toFixed(2)} - ${t('infoBox.coordinateSection.east')} `}</Box>
        <Box>{`${y.toFixed(2)} - ${t('infoBox.coordinateSection.north')} `}</Box>
      </Stack>
      <Button
        onClick={onCopyClick}
        leftIcon={'content_copy'}
        w={'fit-content'}
        variant="secondary"
      >
        {t('infoBox.coordinateSection.copy.label')}
      </Button>
    </Stack>
  );
};
