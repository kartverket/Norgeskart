import { HStack, Stack, Text, VStack } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { decimalToDMS } from '../../../print/EmergencyPoster/utils';

const formatCoordinateDigit = (value: number, useDMS: boolean) => {
  if (useDMS) {
    const DMSformatedPosition = decimalToDMS(value);
    return [
      value.toFixed(7),
      `${DMSformatedPosition.deg}° ${DMSformatedPosition.min}' ${DMSformatedPosition.sec}"`,
    ];
  } else {
    return [value.toFixed(2)];
  }
};

const CoordindateDigit = ({
  label,
  value,
  useDMS,
}: {
  label: string;
  value: number;
  useDMS: boolean;
}) => {
  return (
    <HStack justifyContent={'space-between'} alignItems={'flex-start'}>
      <Text justifySelf={'end'}>{label}:</Text>
      <VStack alignItems={'flex-end'} justifyItems={'flex-end'}>
        {formatCoordinateDigit(value, useDMS).map((text, index) => (
          <Text key={index}>{text}</Text>
        ))}
      </VStack>
    </HStack>
  );
};

export const CoordinateText = ({
  x,
  y,
  isGeographicProjection,
  useDMS,
}: {
  x: number;
  y: number;
  isGeographicProjection: boolean;
  useDMS: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <Stack>
      {isGeographicProjection ? (
        <>
          <CoordindateDigit
            label={t('infoBox.coordinateSection.north')}
            value={y}
            useDMS={useDMS}
          />
          <CoordindateDigit
            label={t('infoBox.coordinateSection.east')}
            value={x}
            useDMS={useDMS}
          />
        </>
      ) : (
        <>
          <CoordindateDigit
            label={t('infoBox.coordinateSection.east')}
            value={x}
            useDMS={useDMS}
          />
          <CoordindateDigit
            label={t('infoBox.coordinateSection.north')}
            value={y}
            useDMS={useDMS}
          />
        </>
      )}
    </Stack>
  );
};
