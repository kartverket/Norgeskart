import { Button, Flex } from '@kvib/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentProjectionAtom } from '../../map/atoms';
import {
  allConfiguredBackgroundLayers,
  backgroundLayerAtom_v2,
} from '../../map/layers/config/backgroundLayers/atoms';

export const BackgroundSelector2 = () => {
  const setBackgroundLayer = useSetAtom(backgroundLayerAtom_v2);
  const currentProjection = useAtomValue(currentProjectionAtom);
  const { t } = useTranslation();
  const layersToShow = allConfiguredBackgroundLayers.filter(
    (layer) =>
      layer.showForProjections == null ||
      layer.showForProjections.includes(currentProjection),
  );
  console.log('Layers to show in BackgroundSelector2:', layersToShow);

  return (
    <Flex flexFlow={'row wrap'} gap={2}>
      {layersToShow.map((layer) => {
        return (
          <Button onClick={() => setBackgroundLayer(layer.layerName)} w={'40%'}>
            {t(
              `map.settings.layers.mapNames.backgroundMaps.${layer.layerName}`,
            )}
          </Button>
        );
      })}
    </Flex>
  );
};
