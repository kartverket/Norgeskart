import { Box, Link, Separator, Text } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { Place } from '../../types/searchTypes';

interface PlaceInfoProps {
  place: Place;
}

export const PlaceInfo = ({ place }: PlaceInfoProps) => {
  const { t } = useTranslation();

  return (
    <Box w="100%" userSelect="text">
      <Text fontSize="sm" fontWeight="semibold">
        {place.name}
      </Text>
      <Text fontSize="sm" color="gray.600">
          {t('placeInfo.locationNumber')}: {place.placeNumber}
      </Text>
      <Text fontSize="sm" color="gray.600">
          {t('placeInfo.nameObjectType')}: {place.placeType}
      </Text>
      <Link
        target="_blank"
        key={place.name}
        href={`https://stadnamn.kartverket.no/fakta/${place.placeNumber}`}
        color="green.600"
        fontSize="sm"
        textDecoration="underline"
        display="inline-block"
        mt={2}
        external
      >
        {t('placeInfo.moreInfo')}
      </Link>
      <Separator mt={2} />
    </Box>
  );
};
