import { Card, CardBody, CardDescription } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { SearchResult } from '../../types/searchTypes';
interface InfoBoxProps {
  result: SearchResult;
}

export const InfoBox = ({ result }: InfoBoxProps) => {
  const { t } = useTranslation();

  let content;

  switch (result.type) {
    case 'Place':
      content = <CardDescription>{t('search.placeName')} i</CardDescription>;
      break;
    case 'Road':
      content = (
        <CardDescription>
          {t('infoBox.roadName')} i {result.road.KOMMUNENAVN} kommune
        </CardDescription>
      );
      break;
    case 'Property':
      content = (
        <CardDescription>
          {t('')} i {result.property.KOMMUNENAVN} kommune
        </CardDescription>
      );
      break;
    case 'Address':
      content = (
        <CardDescription>
          {t('search.addresses')} i {result.address.kommunenavn} kommune
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
