import { Text } from '@kvib/react';
import { XMLParser } from 'fast-xml-parser';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getEffectiveLegendUrl,
  ThemeLayerConfig,
  ThemeLayerDefinition,
} from '../../api/themeLayerConfigApi';
import { ThemeLayerName } from '../layers/themeWMS';
import { StyledLayerDescriptor } from '../types/StyledMapDescriptor';
import { Symbolology } from './Symbolology';
type LayerStyleProps = {
  StyledLayerDescriptor: StyledLayerDescriptor;
};
const parser = new XMLParser({ removeNSPrefix: true });

export const DynamicLegend = ({
  config,
  layer,
}: {
  config: ThemeLayerConfig;
  layer: ThemeLayerDefinition;
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'nb' | 'nn' | 'en';
  const [legendData, setLegendData] = useState<
    LayerStyleProps | null | 'loading'
  >('loading');

  useEffect(() => {
    const fetchStyleData = async () => {
      const legendUrl = getEffectiveLegendUrl(
        config,
        layer.id as ThemeLayerName,
      );
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
    };
    fetchStyleData().then((r) => {
      setLegendData(r);
    });
  }, [layer.id, config]);

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
    <Symbolology
      activeThemeLayers={legendData.StyledLayerDescriptor}
      heading={layer.id}
    />
  );
};
