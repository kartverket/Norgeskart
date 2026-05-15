import { Box, Image } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { scaleAtom } from '../atoms';
import {
  getEffectiveLegendImageUrl,
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
  const scale = useAtomValue(scaleAtom);

  if (!layer.useLegendGraphic) {
    return null;
  }

  const imageUrl = getEffectiveLegendImageUrl(
    config,
    layer.id as ThemeLayerName,
    scale,
  );
  if (!imageUrl) {
    return null;
  }
  return (
    <Box maxW="100%" overflowX="auto">
      <Image src={imageUrl} />
    </Box>
  );
};
