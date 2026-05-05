import { AccordionRoot, Heading, HStack, IconButton, Stack } from '@kvib/react';
import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { displayMapLegendAtom } from '../atoms';
import { activeThemeLayersAtom } from '../layers/atoms';
import { urlGeoJsonLayersAtom } from '../layers/urlGeoJson';
import { hasUrlLayersAtom, urlWmsLayersAtom } from '../layers/urlWms';
import { SingleLayerLegend } from './SingleLayerLegend';
import { UrlLayersLegend } from './UrlLayersLegend';

export const MapLegend = () => {
  const { t } = useTranslation();
  const activeThemeLayers = useAtomValue(activeThemeLayersAtom);
  const setShowMapLegend = useSetAtom(displayMapLegendAtom);
  const urlWmsLayers = useAtomValue(urlWmsLayersAtom);
  const urlGeoJsonLayers = useAtomValue(urlGeoJsonLayersAtom);
  const hasUrlLayers = useAtomValue(hasUrlLayersAtom);

  const themeLayers = Array.from(activeThemeLayers);

  if (themeLayers.length === 0 && !hasUrlLayers) {
    return null;
  }

  const allDefaultValues = [
    ...themeLayers,
    ...urlWmsLayers.map((l) => l.get('id') as string),
    ...urlGeoJsonLayers.map((l) => l.get('id') as string),
  ];

  return (
    <Stack
      w={'100%'}
      bgColor={'white'}
      p={4}
      borderRadius="16px"
      pointerEvents="auto"
      maxH={'100%'}
      overflowY={'hidden'}
    >
      <HStack justify={'space-between'}>
        <Heading size={'sm'}>{t('legend.heading.title')}</Heading>
        <IconButton
          size={'md'}
          variant="tertiary"
          icon="close"
          onClick={() => setShowMapLegend(false)}
        />
      </HStack>
      <AccordionRoot
        collapsible
        multiple
        defaultValue={allDefaultValues}
        overflowY={'auto'}
      >
        {themeLayers.map((l) => (
          <React.Fragment key={l}>
            <SingleLayerLegend layerName={l} />
          </React.Fragment>
        ))}
        <UrlLayersLegend />
      </AccordionRoot>
    </Stack>
  );
};
