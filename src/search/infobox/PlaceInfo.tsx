import { Box, Link, Separator, Text } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { Place } from '../../types/searchTypes';

interface PlaceInfoProps {
  place: Place;
}

export const PlaceInfo = ({ place }: PlaceInfoProps) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Link
        key={place.name}
        mb={4}
        href={`https://stadnamn.kartverket.no/fakta/${place.placeNumber}`}
      >
        <Text>{place.name}</Text>
        <Text fontSize="sm">
          {t('placeInfo.locationNumber')}: {place.placeNumber}
        </Text>
        <Text fontSize="sm">
          {t('placeInfo.nameObjectType')}: {place.placeType}
        </Text>
        <Separator mt={2} />
      </Link>
    </Box>
  );
};
