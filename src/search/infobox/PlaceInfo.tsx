import { Link, Separator, SimpleGrid, Text, VStack } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { Place } from '../../types/searchTypes';

interface PlaceInfoProps {
  place: Place;
}

export const PlaceInfo = ({ place }: PlaceInfoProps) => {
  const { t } = useTranslation();

  return (
    <SimpleGrid
      columns={2}
      templateColumns="1fr auto"
      gap={2}
      w="100%"
      alignItems={'start'}
    >
      <VStack align={'start'} userSelect={'text'}>
        <Text>{place.name}</Text>
        <Text fontSize="sm">
          {t('placeInfo.locationNumber')}: {place.placeNumber}
        </Text>
        <Text fontSize="sm">
          {t('placeInfo.nameObjectType')}: {place.placeType}
        </Text>
        <Separator mt={2} />
      </VStack>
      <Link
        key={place.name}
        href={`https://stadnamn.kartverket.no/fakta/${place.placeNumber}`}
        w={'100%'}
        textDecorationLine={'none'}
        external
      >
        {t('placeInfo.moreInfo')}
      </Link>
    </SimpleGrid>
  );
};
