import { useTranslation } from 'react-i18next';
import {
  getEffectiveLegendImageUrls,
  ThemeLayerConfig,
  ThemeLayerDefinition,
} from '../layers/themeLayerConfigApi';
import { ThemeLayerName } from '../layers/themeWMS';
import { LegendImages } from './LegendImages';

export const ImageLegend = ({
  config,
  layer,
}: {
  config: ThemeLayerConfig;
  layer: ThemeLayerDefinition;
}) => {
  const { i18n } = useTranslation();

  if (!layer.useLegendGraphic) {
    return null;
  }

  const imageUrls = getEffectiveLegendImageUrls(
    config,
    layer.id as ThemeLayerName,
  );
  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  return (
    <LegendImages
      urls={imageUrls}
      layerName={layer.name[i18n.language as 'nb' | 'nn' | 'en']}
    />
  );
};
