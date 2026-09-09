import { Image, VStack } from '@kvib/react';
import {
  getEffectiveLegendImageUrls,
  ThemeLayerConfig,
  ThemeLayerDefinition,
} from '../layers/themeLayerConfigApi';
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

  const imageUrls = getEffectiveLegendImageUrls(
    config,
    layer.id as ThemeLayerName,
  );
  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }
  return (
    <VStack align="flex-start" gap={1}>
      {imageUrls.map((url) => (
        <Image key={url} src={url} />
      ))}
    </VStack>
  );
};
