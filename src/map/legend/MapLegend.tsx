import { AccordionRoot, Heading, Stack } from '@kvib/react';
import { useAtomValue } from 'jotai';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { activeThemeLayersAtom } from '../layers/atoms';
import { SingleLayerLegend } from './SingleLayerLegend';

export const MapLegend = () => {
  const { t } = useTranslation();
  const activeThemeLayers = useAtomValue(activeThemeLayersAtom);
  const layers = Array.from(activeThemeLayers);
  if (layers.length === 0) {
    return null;
  }
  return (
    <Stack
      w={'100%'}
      overflowY={'auto'}
      bgColor={'white'}
      p={4}
      borderRadius="16px"
      pointerEvents="auto"
    >
      <Heading size={'md'}>{t('legend.heading.title')}</Heading>
      <AccordionRoot collapsible multiple defaultValue={layers}>
        {layers.map((l) => (
          <React.Fragment key={l}>
            <SingleLayerLegend layerName={l} />
          </React.Fragment>
        ))}
      </AccordionRoot>
    </Stack>
  );
};
