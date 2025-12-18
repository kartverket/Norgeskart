import { AccordionRoot, Heading, HStack, IconButton, Stack } from '@kvib/react';
import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { displayMapLegendAtom } from '../atoms';
import { activeThemeLayersAtom } from '../layers/atoms';
import { SingleLayerLegend } from './SingleLayerLegend';

export const MapLegend = () => {
  const { t } = useTranslation();
  const activeThemeLayers = useAtomValue(activeThemeLayersAtom);
  const setShowMapLegend = useSetAtom(displayMapLegendAtom);
  const layers = Array.from(activeThemeLayers);
  if (layers.length === 0) {
    return null;
  }
  return (
    <Stack
      w={'100%'}
      bgColor={'white'}
      p={4}
      borderRadius="16px"
      pointerEvents="auto"
    >
      <HStack justify={'space-between'}>
        <Heading size={'md'}>{t('legend.heading.title')}</Heading>
        <IconButton
          variant="tertiary"
          icon="close"
          onClick={() => setShowMapLegend(false)}
        />
      </HStack>
      <AccordionRoot
        collapsible
        multiple
        defaultValue={layers}
        maxH={'30vh'}
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
