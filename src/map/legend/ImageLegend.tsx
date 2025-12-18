import { Image } from '@kvib/react';
import {
  getEffectiveLegendImageUrl,
  ThemeLayerConfig,
  ThemeLayerDefinition,
} from '../../api/themeLayerConfigApi';
import { ThemeLayerName } from '../layers/themeWMS';

export const ImageLegend = ({
  config,
  layer,
}: {
  config: ThemeLayerConfig;
  layer: ThemeLayerDefinition;
}) => {
  if (!layer.useLegendGraphic) {
    return null;
  }

  const imageUrl = getEffectiveLegendImageUrl(
    config,
    layer.id as ThemeLayerName,
  );
  if (!imageUrl) {
    return null;
  }
  return <Image src={imageUrl} />;
};
