import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Heading,
  Text,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from '../../shared/ErrorBoundary';
import {
  getThemeLayerById,
  themeLayerConfig,
} from '../layers/themeLayerConfigApi';
import { ThemeLayerName } from '../layers/themeWMS';
import { DynamicLegend } from './DynamicLegend';
import { ImageLegend } from './ImageLegend';

export const SingleLayerLegend = ({
  layerName,
}: {
  layerName: ThemeLayerName;
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'nb' | 'nn' | 'en';

  const layer = getThemeLayerById(themeLayerConfig, layerName);
  if (!layer || layer.noLegend) {
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
            <ImageLegend config={themeLayerConfig} layer={layer} />
          ) : (
            <DynamicLegend config={themeLayerConfig} layer={layer} />
          )}
        </AccordionItemContent>
      </AccordionItem>
    </ErrorBoundary>
  );
};
