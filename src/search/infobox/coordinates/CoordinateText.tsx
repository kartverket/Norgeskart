import { HStack, Stack, Text } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { ProjectionIdentifier } from '../../../map/projections/types';

const formatCoordinateDigit = (
  value: number,
  projection: ProjectionIdentifier,
) => {
  switch (projection) {
    case 'EPSG:4326': // wgs84
      return value.toFixed(6);
    default:
      return value.toFixed(2);
  }
};

export const CoordinateText = ({
  x,
  y,
  projection,
}: {
  x: number;
  y: number;
  projection: ProjectionIdentifier;
}) => {
  const { t } = useTranslation();
  return (
    <Stack>
      <HStack justifyContent={'space-between'}>
        <Text>{t('infoBox.coordinateSection.north')}:</Text>
        <Text>{formatCoordinateDigit(y, projection)}</Text>
      </HStack>
      <HStack justifyContent={'space-between'}>
        <Text>{t('infoBox.coordinateSection.east')}:</Text>
        <Text>{formatCoordinateDigit(x, projection)}</Text>
      </HStack>
    </Stack>
  );
};
