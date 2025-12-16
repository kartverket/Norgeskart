import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Heading,
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
  if (config.state !== 'hasData') {
    return null;
  }
  const [legendData, setLegendData] = useState<LayerStyleProps | null>(null);

  const layer = getThemeLayerById(config.data, layerName);
  if (!layer) {
    return null;
  }
  const currentLang = i18n.language as 'nb' | 'nn' | 'en';

  const legendUrl = getEffectiveLegendUrl(
    config.data,
    layer.id as ThemeLayerName,
  );

  const lmao = useMemo(async () => {
    if (!legendUrl) return;
    const res = await fetch(legendUrl);
    const text = await res.text();
    const styleObject = parser.parse(text);
    return styleObject as LayerStyleProps;
  }, [layerName]);

  lmao.then((r) => {
    if (r) {
      setLegendData(r);
    }
  });

  if (legendData === null) {
    return null;
  }
  return (
    <ErrorBoundary fallback={t('legend.item.fallbackMessage')}>
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
