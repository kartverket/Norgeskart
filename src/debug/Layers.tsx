import { Box, Heading } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { activeThemeLayersAtom } from '../map/layers/atoms';

export const Layers = () => {
  const backgroundLayers = useAtomValue(activeThemeLayersAtom);

  return (
    <Box>
      <Heading>Active Theme Layers:</Heading>
      <ul>
        {[...backgroundLayers].map((layer) => (
          <li key={layer}>{layer}</li>
        ))}
      </ul>
    </Box>
  );
};
