import { useAtomValue } from 'jotai';
import { activeThemeLayersAtom } from '../layers/atoms';

export const useMapLegend = () => {
  const activeThemeLayers = useAtomValue(activeThemeLayersAtom);
  const layers = Array.from(activeThemeLayers);
};
