import { Card, CardBody, CardDescription } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { SearchResult } from '../../types/searchTypes';

interface InfoBoxProps {
  result: SearchResult;
}

const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export const InfoBox = ({ result }: InfoBoxProps) => {
  const { t } = useTranslation();

  let content;

  switch (result.type) {
    case 'Place':
      content = (
        <CardDescription>
          {t('search.placeName')} {t('infoBox.in')}{' '}
          {result.place.kommuner.map((k) => k.kommunenavn).join(', ')} {t('infoBox.municipality').toLowerCase()} 
        </CardDescription>
      );
      break;
    case 'Road':
      content = (
        <CardDescription>
          {t('infoBox.roadName')} {t('infoBox.in')} {capitalizeFirstLetter(result.road.KOMMUNENAVN)} {t('infoBox.municipality').toLowerCase()}
        </CardDescription>
      );
      break;
    case 'Property':
      content = (
        <CardDescription>
          {t('infoBox.cadastralIdentifier')} {t('infoBox.in')} {capitalizeFirstLetter(result.property.KOMMUNENAVN)} {t('infoBox.municipality').toLowerCase()}
        </CardDescription>
      );
      break;
    case 'Address':
      content = (
        <CardDescription>
          {t('infoBox.address')} {t('infoBox.in')} {capitalizeFirstLetter(result.address.kommunenavn)} {t('infoBox.municipality').toLowerCase()}
        </CardDescription>
      );
      break;
  }

  return (
    <Card>
      <CardBody>{content}</CardBody>
    </Card>
  );
};
