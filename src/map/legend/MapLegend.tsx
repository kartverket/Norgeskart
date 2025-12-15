import { Box } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { activeThemeLayersAtom } from '../layers/atoms';

export const MapLegend = () => {
  const activeThemeLayers = useAtomValue(activeThemeLayersAtom);
  const layers = Array.from(activeThemeLayers);
  return (
    <Box>
      {layers.map((l) => {
        return <Box key={l}>{l}</Box>;
      })}
    </Box>
  );
};
