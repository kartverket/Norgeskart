import { AccordionRoot, Heading, HStack, IconButton, Stack } from '@kvib/react';
import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { displayMapLegendAtom } from '../atoms';
import { activeThemeLayersAtom } from '../layers/atoms';
import { allConfiguredBackgroundLayers, backgroundLayerAtom } from '../layers/config/backgroundLayers/atoms';
import { BackgroundLegend } from './BackgroundLegend';
import { SingleLayerLegend } from './SingleLayerLegend';

export const MapLegend = () => {
  const { t } = useTranslation();
  const activeThemeLayers = useAtomValue(activeThemeLayersAtom);
  const setShowMapLegend = useSetAtom(displayMapLegendAtom);
  const backgroundLayerName = useAtomValue(backgroundLayerAtom);
  const layers = Array.from(activeThemeLayers);

  const hasBackgroundLegend = allConfiguredBackgroundLayers.some(
    (config) => config.layerName === backgroundLayerName && 'legendUrl' in config && !!config.legendUrl,
  );

  if (layers.length === 0 && !hasBackgroundLegend) {
    return null;
  }

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
      <BackgroundLegend />
      <AccordionRoot
        collapsible
        multiple
        defaultValue={layers}
        overflowY={'auto'}
      >
        {layers.map((l) => (
          <React.Fragment key={l}>
            <SingleLayerLegend layerName={l} />
          </React.Fragment>
        ))}
      </AccordionRoot>
    </Stack>
  );
};
