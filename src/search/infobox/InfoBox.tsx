import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
  Card,
  CardBody,
  CardDescription,
} from '@kvib/react';
import { useQuery } from '@tanstack/react-query';
import { transform } from 'ol/proj';
import { useTranslation } from 'react-i18next';
import { getInputCRS } from '../../shared/utils/crsUtils';
import { capitalizeFirstLetter } from '../../shared/utils/stringUtils';
import { SearchResult } from '../../types/searchTypes';
import { getElevation } from '../searchApi';
import { PropertyInfo } from './PropertyInfo';

interface InfoBoxProps {
  result: SearchResult;
}

export const InfoBox = ({ result }: InfoBoxProps) => {
  const { t } = useTranslation();
  const inputCRS = getInputCRS(result);
  const [x, y] = transform([result.lon, result.lat], inputCRS, 'EPSG:25833');

  const { data: elevationData } = useQuery({
    queryKey: ['elevation', x, y],
    queryFn: () => getElevation(x, y),
    enabled: x != null && y != null,
  });

  let content;

  switch (result.type) {
    case 'Place':
      content = (
        <>
          {t('search.placeName')} {t('infoBox.in')}{' '}
          {result.place.kommuner.map((k) => k.kommunenavn).join(', ')}{' '}
          {t('infoBox.municipality').toLowerCase()}
        </>
      );
      break;
    case 'Road':
      content = (
        <>
          {t('infoBox.roadName')} {t('infoBox.in')}{' '}
          {capitalizeFirstLetter(result.road.KOMMUNENAVN)}{' '}
          {t('infoBox.municipality').toLowerCase()}
        </>
      );
      break;
    case 'Property':
      content = (
        <>
          {t('infoBox.cadastralIdentifier')} {t('infoBox.in')}{' '}
          {capitalizeFirstLetter(result.property.KOMMUNENAVN)}{' '}
          {t('infoBox.municipality').toLowerCase()}
        </>
      );
      break;
    case 'Address':
      content = (
        <>
          {t('infoBox.address')} {t('infoBox.in')}{' '}
          {capitalizeFirstLetter(result.address.kommunenavn)}{' '}
          {t('infoBox.municipality').toLowerCase()}
        </>
      );
      break;
  }

  return (
    <Card>
      <CardBody pb={2}>
        <CardDescription>
          {content} <br /> {t('infoBox.heightEstimatedByInterpolation')}{' '}
          {Number(elevationData?.value).toFixed(1)}{' '}
          {t('infoBox.metersAboveSeaLevel')}
        </CardDescription>
        <AccordionRoot collapsible mr={2} mt={5}>
          <AccordionItem value="propertyInfo">
            <AccordionItemTrigger pl={0}>
              {t('infoBox.propertyInfo')}
            </AccordionItemTrigger>
            <AccordionItemContent>
              <PropertyInfo
                lon={result.lon}
                lat={result.lat}
                inputCRS={inputCRS}
              />
            </AccordionItemContent>
          </AccordionItem>
          <AccordionItem value="placeInfo">
            <AccordionItemTrigger pl={0}>
              {t('infoBox.placeinfo')}
            </AccordionItemTrigger>
            <AccordionItemContent>{/*Info kommer her  */}</AccordionItemContent>
          </AccordionItem>
          <AccordionItem value="coordinateInfo">
            <AccordionItemTrigger pl={0}>
              {t('infoBox.coordinateInfo')}
            </AccordionItemTrigger>
            <AccordionItemContent>{/* Info kommer her */}</AccordionItemContent>
          </AccordionItem>
          <AccordionItem value="makeMap">
            <AccordionItemTrigger pl={0}>
              {t('infoBox.makeMap')}
            </AccordionItemTrigger>
            <AccordionItemContent>{/* Info kommer her */}</AccordionItemContent>
          </AccordionItem>
          <AccordionItem value="emergencyPoster">
            <AccordionItemTrigger pl={0}>
              {t('infoBox.emergencyPoster')}
            </AccordionItemTrigger>
            <AccordionItemContent>{/* Info kommer her*/}</AccordionItemContent>
          </AccordionItem>
        </AccordionRoot>
      </CardBody>
    </Card>
  );
};
