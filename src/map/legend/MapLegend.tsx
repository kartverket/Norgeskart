import { AccordionRoot, Heading, HStack, IconButton, Stack } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { displayMapLegendAtom } from '../atoms';
import { activeThemeLayersAtom } from '../layers/atoms';
import { SingleLayerLegend } from './SingleLayerLegend';

interface MapLegendProps {
  inPanel?: boolean;
}

export const MapLegend = ({ inPanel = false }: MapLegendProps) => {
  const { t } = useTranslation();
  const activeThemeLayers = useAtomValue(activeThemeLayersAtom);
  const [isOpen, setShowMapLegend] = useAtom(displayMapLegendAtom);
  const layers = Array.from(activeThemeLayers);

  useEffect(() => {
    if (isOpen && layers.length === 0) {
      setShowMapLegend(false);
    }
  }, [layers.length, isOpen, setShowMapLegend]);

  if (!isOpen || layers.length === 0) {
    return null;
  }

  const accordion = (
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
  );

  if (inPanel) {
    return accordion;
  }

  return (
    <Stack
      width="100%"
      maxWidth="355px"
      m="1"
      bgColor={'white'}
      p={4}
      borderRadius="16px"
      pointerEvents="auto"
      maxHeight="80vh"
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
      {accordion}
    </Stack>
  );
};
