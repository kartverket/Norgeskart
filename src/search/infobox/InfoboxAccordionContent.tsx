import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Box,
  useAccordionContext,
} from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { ProjectionIdentifier } from '../../map/atoms';
import { getInputCRS } from '../../shared/utils/crsUtils';
import { placesNearbyAtom, selectedResultAtom } from '../atoms';
import { CoordinateInfo } from './CoordinateSection';
import { FeatureInfoSection } from './FeatureInfoSection';
import { PlaceInfo } from './PlaceInfo';
import { PropertyInfo } from './PropertyInfo';

export const InfoboxAccordionContent = () => {
  const placesNearby = useAtomValue(placesNearbyAtom);
  const selectedResult = useAtomValue(selectedResultAtom);
  const accordion = useAccordionContext();
  const ph = usePostHog();

  // It works ok, but might trigger falsly when two items are open and you close one of them.
  useEffect(() => {
    if (
      accordion.focusedValue != null &&
      accordion.value.includes(accordion.focusedValue)
    ) {
      ph.capture('infobox_accordion_item_opened', {
        item: accordion.focusedValue,
      });
    }
  }, [accordion, ph]);
  if (!selectedResult) {
    return null;
  }
  const inputCRS = getInputCRS(selectedResult);
  return (
    <>
      {['Property', 'Coordinate', 'Address'].includes(selectedResult.type) && (
        <PropertyInfo
          lon={selectedResult.lon}
          lat={selectedResult.lat}
          inputCRS={inputCRS}
        />
      )}

      {selectedResult.type === 'Place' && (
        <AccordionItem value="placeInfo">
          <AccordionItemTrigger pl={0}>
            {t('infoBox.placeinfo')}
          </AccordionItemTrigger>
          <AccordionItemContent>
            <PlaceInfo place={selectedResult.place} />
          </AccordionItemContent>
        </AccordionItem>
      )}
      {placesNearby.length > 0 && (
        <AccordionItem value={'PlacesNearby'}>
          <AccordionItemTrigger pl={0}>
            {t('infoBox.placesNearby')}
          </AccordionItemTrigger>
          <AccordionItemContent>
            {placesNearby.map((place) => (
              <Box
                key={place.placeNumber}
                mb={2}
                p={2}
                borderBottom="1px solid #E2E8F0"
              >
                <PlaceInfo place={place} />
              </Box>
            ))}
          </AccordionItemContent>
        </AccordionItem>
      )}
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
      <FeatureInfoSection />
    </>
  );
};
