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
import { getInputCRS } from '../../shared/utils/crsUtils';
import { isNumberOk } from '../../shared/utils/numberUtils';
import { SearchResult } from '../../types/searchTypes';
import { getElevation } from '../searchApi';

interface InfoBoxContentProps {
  result: SearchResult;
}

const InfoBoxTextContent = ({ result }: { result: SearchResult }) => {
  const { t } = useTranslation();
  switch (result.type) {
    case 'Place':
      return (
        <Text>
          {`${t('search.placeName')} ${result.place.municipalities != null && `${t('infoBox.in')} ${result.place.municipalities.map((k) => k.kommunenavn).join(', ')} ${t('infoBox.municipality').toLowerCase()}`}`}
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
const InfoBoxElevationContent = ({ result }: { result: SearchResult }) => {
  const { t } = useTranslation();
  const inputCRS = getInputCRS(result);

  const { data: elevationData, status } = useQuery<{ value: string }>({
    queryKey: ['elevation', result.lon, result.lat],
    queryFn: () => getElevation(result.lon, result.lat, inputCRS),
    enabled: isNumberOk(result.lat) && isNumberOk(result.lon),
  });
  if (status !== 'success') {
    return null;
  }
  const numericValue = Number(elevationData.value);
  if (isNaN(numericValue)) {
    return null;
  }

  if (status === 'success' && elevationData) {
    return (
      <HStack>
        <Text>
          {t('infoBox.heightEstimatedByInterpolation')}{' '}
          {numericValue.toFixed(1)} {t('infoBox.metersAboveSeaLevel')}
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

export const InfoBoxPreamble = ({ result }: InfoBoxContentProps) => {
  return (
    <Box userSelect={'text'}>
      <InfoBoxTextContent result={result} />
      <InfoBoxElevationContent result={result} />{' '}
    </Box>
  );
};
