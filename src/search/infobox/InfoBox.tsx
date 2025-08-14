import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
  Card,
  CardBody,
} from '@kvib/react';
import { useQuery } from '@tanstack/react-query';
import { transform } from 'ol/proj';
import { useTranslation } from 'react-i18next';
import { getInputCRS } from '../../shared/utils/crsUtils';
import { SearchResult } from '../../types/searchTypes';
import { getElevation } from '../searchApi';
import { InfoBoxContent } from './InfoBoxContent';
import { PlaceInfo } from './PlaceInfo';
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

  return (
    <Card>
      <CardBody
        pb={2}
        maxHeight="calc(100vh - 130px)"
        overflowY="auto"
        overflowX="hidden"
      >
        <InfoBoxContent result={result} elevationData={elevationData} />
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
            <AccordionItemContent>
              <PlaceInfo
                lon={result.lon}
                lat={result.lat}
                inputCRS={inputCRS}
              />
            </AccordionItemContent>
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
