import { Box, Image } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { availableScales, backgroundLegendUrlAtom, scaleAtom } from '../atoms';

const snapToNearest = (scale: number): number =>
  availableScales.reduce((prev, curr) =>
    Math.abs(curr - scale) < Math.abs(prev - scale) ? curr : prev,
  );

export const BackgroundLegend = () => {
  const scale = useAtomValue(scaleAtom);
  const legendUrl = useAtomValue(backgroundLegendUrlAtom);

  if (!legendUrl) {
    return null;
  }

  const snappedScale = scale ? snapToNearest(scale) : availableScales[4];
  const imageUrl = legendUrl.replace('{scale}', String(snappedScale));

  return (
    <Box maxW="100%" overflowX="auto">
      <Image src={imageUrl} />
    </Box>
  );
};
