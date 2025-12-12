import {
  Box,
  HStack,
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@kvib/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SearchResult } from '../../types/searchTypes';
import { getElevation } from '../searchApi';

interface InfoBoxContentProps {
  result: SearchResult;
  x: number;
  y: number;
}

const InfoBoxTextContent = ({ result }: { result: SearchResult }) => {
  const { t } = useTranslation();
  switch (result.type) {
    case 'Place':
      return (
        <Text>
          {`${t('search.placeName')} ${t('infoBox.in')} ${result.place.municipalities.map((k) => k.kommunenavn).join(', ')} ${t('infoBox.municipality').toLowerCase()}`}
        </Text>
      );

    case 'Road':
      return (
        <Text>
          {`${t('infoBox.roadName')} ${t('infoBox.in')} ${result.road.KOMMUNENAVN} ${t('infoBox.municipality').toLowerCase()}`}
        </Text>
      );

    case 'Property':
      return (
        <Text>
          {`${t('infoBox.cadastralIdentifier')} ${t('infoBox.in')} ${result.property.KOMMUNENAVN} ${t('infoBox.municipality').toLowerCase()}`}
        </Text>
      );

    case 'Address':
      return (
        <Text>
          {`${t('infoBox.address')} ${t('infoBox.in')} ${result.address.kommunenavn} ${t('infoBox.municipality').toLowerCase()}`}
        </Text>
      );
  }
};
const InfoBoxElevationContent = ({ x, y }: { x: number; y: number }) => {
  const { t } = useTranslation();

  const { data: elevationData, status } = useQuery({
    queryKey: ['elevation', x, y],
    queryFn: () => getElevation(x, y),
    enabled: x != null && y != null,
  });

  if (status === 'success' && elevationData) {
    return (
      <HStack>
        <Text>
          {t('infoBox.heightEstimatedByInterpolation')}{' '}
          {Number(elevationData?.value).toFixed(1)}{' '}
          {t('infoBox.metersAboveSeaLevel')}
        </Text>
        <Popover>
          <PopoverTrigger cursor="pointer">
            <Icon icon={'info'} />
          </PopoverTrigger>
          <PopoverContent>
            <Box p={2}>
              <Text>{t('infoBox.metersAboveSeaLevelTooltip')}</Text>
            </Box>
          </PopoverContent>
        </Popover>
      </HStack>
    );
  }
  return null;
};

export const InfoBoxPreamble = ({ result, x, y }: InfoBoxContentProps) => {
  return (
    <Box userSelect={'text'}>
      <InfoBoxTextContent result={result} />
      <InfoBoxElevationContent x={x} y={y} />{' '}
    </Box>
  );
};
