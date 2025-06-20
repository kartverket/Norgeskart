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
import { SearchResult } from '../../types/searchTypes';
import { getElevation } from '../searchApi';
import { getInputCRS } from './SearchResults';

interface InfoBoxProps {
  result: SearchResult;
}

const capitalizeFirstLetter = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export const InfoBox = ({ result }: InfoBoxProps) => {
  const { t } = useTranslation();
  const inputCRS = getInputCRS(result);
  const [x, y] = transform([result.lon, result.lat], inputCRS, 'EPSG:25833');

  const { data: elevationData } = useQuery({
    queryKey: ['elevation', x, y],
    queryFn: () => getElevation(x, y),
    enabled: x != null && y != null,
  });

  console.log('Elevation data:', elevationData);

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
              {/* Her kan du legge til ønsket innhold for handlinger */}
            </AccordionItemContent>
          </AccordionItem>
          <AccordionItem value="placeInfo">
            <AccordionItemTrigger pl={0}>
              {t('infoBox.placeInfo')}
            </AccordionItemTrigger>
          </AccordionItem>
          <AccordionItem value="coordinateInfo">
            <AccordionItemTrigger pl={0}>
              {t('infoBox.coordinateInfo')}
            </AccordionItemTrigger>
          </AccordionItem>
          <AccordionItem value="makeMap">
            <AccordionItemTrigger pl={0}>
              {t('infoBox.makeMap')}
            </AccordionItemTrigger>
          </AccordionItem>
          <AccordionItem value="emergencyPoster">
            <AccordionItemTrigger pl={0}>
              {t('infoBox.emergencyPoster')}
            </AccordionItemTrigger>
          </AccordionItem>
        </AccordionRoot>
      </CardBody>
    </Card>
  );
};
