import { Box, Heading, Text } from '@kvib/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SearchResult } from '../../types/searchTypes';
import { getElevation } from '../searchApi';

interface InfoBoxContentProps {
  result: SearchResult;
  x: number;
  y: number;
}

export const InfoBoxContent = ({ result, x, y }: InfoBoxContentProps) => {
  const { t } = useTranslation();

  const { data: elevationData, status } = useQuery({
    queryKey: ['elevation', x, y],
    queryFn: () => getElevation(x, y),
    enabled: x != null && y != null,
  });
  let content;

  switch (result.type) {
    case 'Place':
      content = `${t('search.placeName')} ${t('infoBox.in')} ${result.place.municipalities.map((k) => k.kommunenavn).join(', ')} ${t('infoBox.municipality').toLowerCase()}`;
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
    case 'Coordinate':
      content = `${t('infoBox.coordinateSystem')}: ${result.coordinate.projection}`;
      break;
  }

  return (
    <Box>
      <Heading as="h3" fontSize="xl" mb={2}>
        {result.name}
      </Heading>
      <Text>{content}</Text>
      {status === 'success' && elevationData && (
        <>
          {t('infoBox.heightEstimatedByInterpolation')}{' '}
          {Number(elevationData?.value).toFixed(1)}{' '}
          {t('infoBox.metersAboveSeaLevel')}
        </>
      )}
    </Box>
  );
};
