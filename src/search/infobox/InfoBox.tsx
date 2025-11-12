import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
  Box,
  Flex,
  Heading,
  IconButton,
  Stack,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { transform } from 'ol/proj';
import { useTranslation } from 'react-i18next';
import { ProjectionIdentifier } from '../../map/atoms';
import { getInputCRS } from '../../shared/utils/crsUtils';
import { selectedResultAtom } from '../atoms';
import { CoordinateInfo } from './CoordinateSection';
import { InfoBoxContent } from './InfoBoxContent';
import { PlaceInfo } from './PlaceInfo';
import { PropertyInfo } from './PropertyInfo';

export const InfoBox = () => {
  const [selectedResult, setSelectedResult] = useAtom(selectedResultAtom);
  const { t } = useTranslation();

  if (selectedResult === null) {
    return null;
  }
  const inputCRS = getInputCRS(selectedResult);
  const [x, y] = transform(
    [selectedResult.lon, selectedResult.lat],
    inputCRS,
    'EPSG:25833',
  );

  return (
    <Stack
      position={'fixed'}
      right={'16px'}
      w={'400px'}
      p={4}
      borderRadius={'16px'}
      bg="white"
    >
      <Flex justifyContent={'space-between'} alignItems="center">
        <Heading size={'lg'}>{selectedResult.name}</Heading>
        <IconButton
          onClick={() => setSelectedResult(null)}
          icon={'close'}
          variant="ghost"
          alignSelf={'flex-end'}
        />
      </Flex>
      <InfoBoxContent result={selectedResult} x={x} y={y} />
      <Box overflowY="auto" overflowX="hidden" maxHeight="50vh">
        <AccordionRoot collapsible defaultValue={['propertyInfo']}>
          {selectedResult.type === 'Property' && (
            <AccordionItem value="propertyInfo">
              <AccordionItemTrigger pl={0}>
                {t('infoBox.propertyInfo')}
              </AccordionItemTrigger>
              <AccordionItemContent>
                <PropertyInfo
                  lon={selectedResult.lon}
                  lat={selectedResult.lat}
                  inputCRS={inputCRS}
                />
              </AccordionItemContent>
            </AccordionItem>
          )}
          <AccordionItem value="placeInfo">
            <AccordionItemTrigger pl={0}>
              {t('infoBox.placeinfo')}
            </AccordionItemTrigger>
            <AccordionItemContent>
              <PlaceInfo
                lon={selectedResult.lon}
                lat={selectedResult.lat}
                inputCRS={inputCRS}
              />
            </AccordionItemContent>
          </AccordionItem>
          <AccordionItem value="coordinateInfo">
            <AccordionItemTrigger pl={0}>
              {t('infoBox.coordinateInfo')}
            </AccordionItemTrigger>
            <AccordionItemContent>
              <CoordinateInfo
                lon={selectedResult.lon}
                lat={selectedResult.lat}
                inputCRS={inputCRS as ProjectionIdentifier}
              />
            </AccordionItemContent>
          </AccordionItem>
        </AccordionRoot>
      </Box>
    </Stack>
  );
};
