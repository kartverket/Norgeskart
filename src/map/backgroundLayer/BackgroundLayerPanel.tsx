import { Box } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentProjectionAtom } from '../atoms.ts';
import { BackgroundLayerName } from '../layers/backgroundLayers.ts';
import { backgroundLayerAtom } from '../layers/config/backgroundLayers/atoms.ts';
import {
  BackgroundLayerGrid,
  getAvailableBackgroundLayers,
} from './BackgroundLayerGrid.tsx';

export const BackgroundLayerPanel = ({
  onSelectComplete,
}: {
  onSelectComplete: () => void;
}) => {
  const [backgroundLayer, setBackgroundLayer] = useAtom(backgroundLayerAtom);
  const { t } = useTranslation();

  const currentProjection = useAtomValue(currentProjectionAtom);

  const sortedLayers = getAvailableBackgroundLayers(currentProjection);

  const handleSetLayer = (layer: BackgroundLayerName) => {
    setBackgroundLayer(layer);
    onSelectComplete();
  };

  return (
    <Box backgroundColor="#FFFF" p={2} borderRadius={10} w={'100%'}>
      <BackgroundLayerGrid
        layers={sortedLayers.map((layerName) => ({
          value: layerName,
          label: t(`map.settings.layers.mapNames.backgroundMaps.${layerName}`),
        }))}
        currentLayer={backgroundLayer}
        setLayer={handleSetLayer}
        width={'inherit'}
      />
    </Box>
  );
};
