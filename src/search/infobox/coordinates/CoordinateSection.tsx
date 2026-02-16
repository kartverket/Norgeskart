import { Button, HStack, Stack, Text, toaster } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { transform } from 'ol/proj';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../../map/atoms';
import { ProjectionIdentifier } from '../../../map/projections/types';
import { ProjectionSelector } from '../../../shared/Components/ProjectionSelector';
import { CoordinateText } from './CoordinateText';

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
      <HStack justifyContent="space-between" alignItems="baseline">
        <Text fontWeight={'bold'}>
          {t('infoBox.coordinateSection.differentCrs')}
        </Text>

        <ProjectionSelector
          default={currentMapProjection}
          value={selectedProjection}
          onProjectionChange={setSelectedProjection}
          label={t('infoBox.coordinateSection.differentCrs')}
          textColor="black"
        />
      </HStack>

      <CoordinateText x={x} y={y} projection={selectedProjection} />
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
