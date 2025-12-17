import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Heading,
  Text,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  getThemeLayerById,
  themeLayerConfigLoadableAtom,
} from '../../api/themeLayerConfigApi';
import { ErrorBoundary } from '../../shared/ErrorBoundary';
import { ThemeLayerName } from '../layers/themeWMS';
import { DynamicLegend } from './DynamicLegend';
import { ImageLegend } from './ImageLegend';

export const SingleLayerLegend = ({
  layerName,
}: {
  layerName: ThemeLayerName;
}) => {
  const { t, i18n } = useTranslation();
  const config = useAtomValue(themeLayerConfigLoadableAtom);
  const currentLang = i18n.language as 'nb' | 'nn' | 'en';

  if (config.state !== 'hasData') {
    return null;
  }

  const layer = getThemeLayerById(config.data, layerName);
  if (!layer) {
    return null;
  }

  const fallback = (
    <Text>
      {layer.name[currentLang] + ' ' + t('legend.item.fallbackMessage')}
    </Text>
  );

  return (
    <ErrorBoundary fallback={fallback}>
      <AccordionItem value={layer.id}>
        <AccordionItemTrigger>
          <Heading size={'sm'}>{layer.name[currentLang]}</Heading>
        </AccordionItemTrigger>
        <AccordionItemContent>
          {layer.useLegendGraphic ? (
            <ImageLegend config={config.data} layer={layer} />
          ) : (
            <DynamicLegend config={config.data} layer={layer} />
          )}
        </AccordionItemContent>
      </AccordionItem>
    </ErrorBoundary>
  );
};
