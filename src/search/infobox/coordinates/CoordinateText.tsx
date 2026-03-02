import { HStack, Stack, Text, VStack } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { ProjectionIdentifier } from '../../../map/projections/types';
import { decimalToDMS } from '../../../print/EmergencyPoster/utils';

const formatCoordinateDigit = (
  value: number,
  projection: ProjectionIdentifier,
) => {
  switch (projection) {
    case 'EPSG:4326':
    case 'EPSG:3857':
    case 'EPSG:4230': {
      const DMSformatedPosition = decimalToDMS(value);
      return [
        value.toFixed(7),
        `${DMSformatedPosition.deg}° ${DMSformatedPosition.min}' ${DMSformatedPosition.sec}"`,
      ];
    }

    default:
      return [value.toFixed(2)];
  }
};

const isGeographicProjection = (projection: ProjectionIdentifier): boolean => {
  return projection === 'EPSG:4326' || projection === 'EPSG:4230';
};

const CoordindateDigit = ({
  label,
  value,
  projection,
}: {
  label: string;
  value: number;
  projection: ProjectionIdentifier;
}) => {
  return (
    <HStack justifyContent={'space-between'} alignItems={'flex-start'}>
      <Text fontWeight={'bold'} justifySelf={'end'}>
        {label}:
      </Text>
      <VStack alignItems={'flex-end'} justifyItems={'flex-end'}>
        {formatCoordinateDigit(value, projection).map((text, index) => (
          <Text key={index}>{text}</Text>
        ))}
      </VStack>
    </HStack>
  );
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
  const showNorthEast = isGeographicProjection(projection);

  return (
    <Stack>
      {showNorthEast ? (
        <>
          <CoordindateDigit
            label={t('infoBox.coordinateSection.north')}
            value={y}
            projection={projection}
          />
          <CoordindateDigit
            label={t('infoBox.coordinateSection.east')}
            value={x}
            projection={projection}
          />
        </>
      ) : (
        <>
          <CoordindateDigit
            label={t('infoBox.coordinateSection.east')}
            value={x}
            projection={projection}
          />
          <CoordindateDigit
            label={t('infoBox.coordinateSection.north')}
            value={y}
            projection={projection}
          />
        </>
      )}
    </Stack>
  );
};
