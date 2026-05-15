import { Box, Image } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { availableScales, scaleAtom } from '../atoms';
import { allConfiguredBackgroundLayers, backgroundLayerAtom } from '../layers/config/backgroundLayers/atoms';

const snapToNearest = (scale: number): number =>
  availableScales.reduce((prev, curr) =>
    Math.abs(curr - scale) < Math.abs(prev - scale) ? curr : prev,
  );

export const BackgroundLegend = () => {
  const scale = useAtomValue(scaleAtom);
  const backgroundLayerName = useAtomValue(backgroundLayerAtom);

  const layerConfig = allConfiguredBackgroundLayers.find(
    (config) => config.layerName === backgroundLayerName,
  );

  if (!layerConfig || !('legendUrl' in layerConfig) || !layerConfig.legendUrl) {
    return null;
  }

  const snappedScale = scale ? snapToNearest(scale) : availableScales[4];
  const imageUrl = layerConfig.legendUrl.replace('{scale}', String(snappedScale));

  return (
    <Box maxW="100%" overflowX="auto">
      <Image src={imageUrl} />
    </Box>
  );
};
