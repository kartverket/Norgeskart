import { Box, Text } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { SearchResult } from '../../types/searchTypes';

interface InfoBoxContentProps {
  result: SearchResult;
  elevationData?: { value: number };
}

export const InfoBoxContent = ({
  result,
  elevationData,
}: InfoBoxContentProps) => {
  const { t } = useTranslation();
  let content;

    switch (result.type) {
    case 'Place':
      content = `${t('search.placeName')} ${t('infoBox.in')} ${result.place.kommuner.map((k) => k.kommunenavn).join(', ')} ${t('infoBox.municipality').toLowerCase()}`;
      break;
    case 'Road':
      content = `${t('infoBox.roadName')} ${t('infoBox.in')} ${result.road.KOMMUNENAVN} ${t('infoBox.municipality').toLowerCase()}`;
      break;
    case 'Property':
      content = `${t('infoBox.cadastralIdentifier')} ${t('infoBox.in')} ${result.property.KOMMUNENAVN} ${t('infoBox.municipality').toLowerCase()}`;
      break;
    case 'Address':
      content = `${t('infoBox.address')} ${t('infoBox.in')} ${result.address.kommunenavn} ${t('infoBox.municipality').toLowerCase()}`;
      break;
  }

  return (
    <Box>
      <Heading as="h3" fontSize="xl" mb={2}>
        {result.name}
      </Heading>
      <Text>{content}</Text>
      {t('infoBox.heightEstimatedByInterpolation')}{' '}
      {Number(elevationData?.value).toFixed(1)}{' '}
      {t('infoBox.metersAboveSeaLevel')}
    </Box>
  );
};
