import { Box, Image } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { availableScales, backgroundLegendUrlAtom, scaleAtom } from '../atoms';

const snapToNearest = (scale: number): number =>
  availableScales.reduce((prev, curr) =>
    Math.abs(curr - scale) < Math.abs(prev - scale) ? curr : prev,
  );

export const BackgroundLegend = () => {
  const scale = useAtomValue(scaleAtom);
  const legendUrl = useAtomValue(backgroundLegendUrlAtom);
  // URL whose @2x variant failed (older MapProxy backends have none): show 1x only.
  const [no2x, setNo2x] = useState<string | null>(null);

  if (!legendUrl) {
    return null;
  }

  const snappedScale = scale ? snapToNearest(scale) : availableScales[4];
  const imageUrl = legendUrl.replace('{scale}', String(snappedScale));
  const hidpiUrl = imageUrl.replace(/\.png$/, '@2x.png');
  const srcSet =
    hidpiUrl !== imageUrl && no2x !== imageUrl
      ? `${imageUrl} 1x, ${hidpiUrl} 2x`
      : undefined;

  return (
    <Box maxW="100%" overflowX="auto">
      <Image
        key={srcSet ? 'hidpi' : 'plain'}
        src={imageUrl}
        srcSet={srcSet}
        onError={() => srcSet && setNo2x(imageUrl)}
      />
    </Box>
  );
};
