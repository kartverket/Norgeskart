import { Box, Grid, Text, VStack } from '@kvib/react';
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
  const coordinates = isGeographicProjection
    ? [
        { label: t('infoBox.coordinateSection.north'), value: y },
        { label: t('infoBox.coordinateSection.east'), value: x },
      ]
    : [
        { label: t('infoBox.coordinateSection.east'), value: x },
        { label: t('infoBox.coordinateSection.north'), value: y },
      ];

  return (
    <Box>
      <Grid
        templateColumns="repeat(2, minmax(0, 1fr))"
        borderBottom="1px solid"
        borderColor="green.200"
        pb={1}
      >
        {coordinates.map(({ label }) => (
          <Text key={label} fontWeight="semibold" textAlign="left">
            {label}
          </Text>
        ))}
      </Grid>
      <Grid
        templateColumns="repeat(2, minmax(0, 1fr))"
        borderBottom="1px solid"
        borderColor="green.200"
        py={2}
      >
        {coordinates.map(({ label, value }) => (
          <VStack key={label} gap={0} alignItems="flex-start">
            {formatCoordinateDigit(value, useDMS).map((text, index) => (
              <Text key={index} fontWeight="semibold">
                {text}
              </Text>
            ))}
          </VStack>
        ))}
      </Grid>
    </Box>
  );
};
