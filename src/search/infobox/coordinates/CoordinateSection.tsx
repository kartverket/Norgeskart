import { Button, HStack, Stack, Text, toaster, Tooltip } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { transform } from 'ol/proj';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../../map/atoms';
import { backgroundLayerAtom } from '../../../map/layers/config/backgroundLayers/atoms';
import { ProjectionIdentifier } from '../../../map/projections/types';
import { decimalToDMS } from '../../../print/EmergencyPoster/utils';
import { ProjectionSelector } from '../../../shared/Components/ProjectionSelector';
import { CoordinateText } from './CoordinateText';

interface CoordinateInfoProps {
  lat: number;
  lon: number;
  inputCRS: ProjectionIdentifier;
}
export const CoordinateInfo = ({ lat, lon, inputCRS }: CoordinateInfoProps) => {
  const map = useAtomValue(mapAtom);
  const activeBackgroundLayer = useAtomValue(backgroundLayerAtom);
  const { t } = useTranslation();
  const currentMapProjection = map
    .getView()
    .getProjection()
    .getCode() as ProjectionIdentifier;
  const defaultProjection: ProjectionIdentifier =
    activeBackgroundLayer === 'nautical-background'
      ? 'EPSG:4326'
      : currentMapProjection;
  const [selectedProjection, setSelectedProjection] =
    useState<ProjectionIdentifier>(defaultProjection);

  const [x, y] = transform([lon, lat], inputCRS, selectedProjection);

  const isGeographic = selectedProjection === 'EPSG:4326'; // should it be flipped for others ? 4230?  || selectedProjection === 'EPSG:4230';
  const showsDMS =
    selectedProjection === 'EPSG:4326' ||
    selectedProjection === 'EPSG:3857' ||
    selectedProjection === 'EPSG:4230';

  const onCopyClick = () => {
    const decimals = isGeographic ? 7 : 2;
    const coordString = isGeographic
      ? `${y.toFixed(decimals)} ${x.toFixed(decimals)}`
      : `${x.toFixed(decimals)},${y.toFixed(decimals)}@${selectedProjection}`;

    navigator.clipboard.writeText(coordString);
    toaster.create({
      title: t('infoBox.coordinateSection.copy.toast.title'),
      duration: 2000,
    });
  };

  const onCopyDMSClick = () => {
    const formatDMS = (value: number) => {
      const dms = decimalToDMS(value);
      const sign = dms.sign < 0 ? '-' : '';
      return `${sign}${dms.deg}° ${dms.min}' ${dms.sec}"`;
    };
    const coordString = isGeographic
      ? `${formatDMS(y)} N, ${formatDMS(x)} E`
      : `${formatDMS(x)}, ${formatDMS(y)}`;

    navigator.clipboard.writeText(coordString);
    toaster.create({
      title: t('infoBox.coordinateSection.copyDMS.toast.title'),
      duration: 2000,
    });
  };

  return (
    <Stack>
      <HStack justifyContent="space-between" alignItems="baseline">
        <Text w={'20%'}>{t('infoBox.coordinateSection.differentCrs')}</Text>

        <ProjectionSelector
          default={defaultProjection}
          value={selectedProjection}
          onProjectionChange={setSelectedProjection}
          label={t('infoBox.coordinateSection.differentCrs')}
          textColor="black"
        />
      </HStack>

      <CoordinateText x={x} y={y} projection={selectedProjection} />
      <HStack>
        <Tooltip
          content={t('infoBox.coordinateSection.copy.toast.title')}
          portalled={false}
          positioning={{ placement: 'top' }}
        >
          <Button
            onClick={onCopyClick}
            leftIcon={'content_copy'}
            w={'fit-content'}
            variant="secondary"
            size="xs"
          >
            {showsDMS
              ? t('infoBox.coordinateSection.copy.label_geo')
              : t('infoBox.coordinateSection.copy.label')}
          </Button>
        </Tooltip>
        {showsDMS && (
          <Tooltip
            content={t('infoBox.coordinateSection.copyDMS.toast.title')}
            portalled={false}
            positioning={{ placement: 'top' }}
          >
            <Button
              onClick={onCopyDMSClick}
              leftIcon={'content_copy'}
              w={'fit-content'}
              variant="secondary"
              size="xs"
            >
              {t('infoBox.coordinateSection.copyDMS.label')}
            </Button>
          </Tooltip>
        )}
      </HStack>
    </Stack>
  );
};
