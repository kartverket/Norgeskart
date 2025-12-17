import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Heading,
  Text,
} from '@kvib/react';
import { XMLParser } from 'fast-xml-parser';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getEffectiveLegendUrl,
  getThemeLayerById,
  themeLayerConfigLoadableAtom,
} from '../../api/themeLayerConfigApi';
import { ErrorBoundary } from '../../shared/ErrorBoundary';
import { ThemeLayerName } from '../layers/themeWMS';
import { StyledLayerDescriptor } from '../types/StyledMapDescriptor';
import { Symbolology } from './Symbolology';

type LayerStyleProps = {
  StyledLayerDescriptor: StyledLayerDescriptor;
};
const parser = new XMLParser({ removeNSPrefix: true });

export const SingleLayerLegend = ({
  layerName,
}: {
  layerName: ThemeLayerName;
}) => {
  const { t, i18n } = useTranslation();
  const config = useAtomValue(themeLayerConfigLoadableAtom);

  const [legendData, setLegendData] = useState<
    LayerStyleProps | null | 'loading'
  >('loading');

  if (config.state !== 'hasData') {
    222;
    return null;
  }

  const layer = getThemeLayerById(config.data, layerName);
  if (!layer) {
    return null;
  }
  const currentLang = i18n.language as 'nb' | 'nn' | 'en';

  const legendUrl = getEffectiveLegendUrl(
    config.data,
    layer.id as ThemeLayerName,
  );

  const fetchStyleData = useMemo(async () => {
    if (!legendUrl) return null;
    const res = await fetch(legendUrl);
    if (!res.ok) {
      return null;
    }
    const text = await res.text();
    const styleObject = parser.parse(text);
    if (styleObject) {
      return styleObject as LayerStyleProps;
    }
    return null;
  }, [layerName]);

  fetchStyleData.then((r) => {
    setLegendData(r);
  });
  console.log('legendData', legendData);
  const fallback = (
    <Text>
      {layer.name[currentLang] + ' ' + t('legend.item.fallbackMessage')}
    </Text>
  );

  if (legendData === null) {
    return fallback;
  }

  if (legendData === 'loading') {
    return null;
  }
  return (
    <ErrorBoundary fallback={fallback}>
      <AccordionItem value={layer.id}>
        <AccordionItemTrigger>
          <Heading size={'sm'}>{layer.name[currentLang]}</Heading>
        </AccordionItemTrigger>
        <AccordionItemContent>
          <Symbolology
            activeThemeLayers={legendData.StyledLayerDescriptor}
            heading={layer.id}
          />
        </AccordionItemContent>
      </AccordionItem>
    </ErrorBoundary>
  );
};
