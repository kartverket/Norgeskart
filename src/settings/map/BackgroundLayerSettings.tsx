import { Box, Button, Image, SimpleGrid, Text, VStack } from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { useAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  currentProjectionAtom,
  getBackgroundLayerImageName,
} from '../../map/atoms';
import { BackgroundLayerName } from '../../map/layers/backgroundLayers';
import {
  allConfiguredBackgroundLayers,
  backgroundLayerAtom_v2,
} from '../../map/layers/config/backgroundLayers/atoms.ts';

// Prioritetskart for sortering
const layerPriorityMap = new Map<BackgroundLayerName, number>([
  ['topo', 1],
  ['topograatone', 2],
  ['toporaster', 3],
  ['sjokartraster', 4],
  ['nautical-background', 5],
  ['oceanicelectronic', 6],
  ['Nibcache_web_mercator_v2', 7],
  ['Nibcache_UTM32_EUREF89_v2', 8],
  ['Nibcache_UTM33_EUREF89_v2', 9],
  ['Nibcache_UTM35_EUREF89_v2', 10],
  ['Basisdata_NP_Basiskart_Svalbard_WMTS_25833', 11],
  ['Basisdata_NP_Basiskart_JanMayen_WMTS_25833', 12],
]);

const layerPrioritySort = (a: BackgroundLayerName, b: BackgroundLayerName) => {
  const priorityA = layerPriorityMap.get(a) || 0;
  const priorityB = layerPriorityMap.get(b) || 0;
  return priorityA - priorityB;
};

const POLAR_LAYER_EXTENTS: Partial<
  Record<BackgroundLayerName, [number, number, number, number]>
> = {
  Basisdata_NP_Basiskart_Svalbard_WMTS_25833: [
    369976.39, 8221306.54, 878234.72, 9010718.77,
  ],
  Basisdata_NP_Basiskart_JanMayen_WMTS_25833: [
    -393783.25, 7978220.98, -276963.74, 8084965.52,
  ],
};

interface LayerCardProps {
  label: string;
  thumbnailUrl: string;
  isActive?: boolean;
  onClick: () => void;
}

const LayerCard = ({
  label,
  thumbnailUrl,
  isActive,
  onClick,
}: LayerCardProps) => (
  <Button
    onClick={onClick}
    variant="ghost"
    colorPalette="green"
    borderWidth={isActive ? 2 : 0}
    borderColor={isActive ? 'green.500' : 'transparent'}
    borderRadius="lg"
    display="flex"
    alignItems="center"
    width="135px"
    justifyContent="center"
    maxHeight="100px"
    padding={10}
  >
    <VStack>
      <Box width="46px" height="46px" borderRadius="md" overflow="hidden">
        <Image src={thumbnailUrl} alt={label} width="100%" objectFit="cover" />
      </Box>
      <Text fontSize="xs" textAlign="center" lineHeight="short">
        {label}
      </Text>
    </VStack>
  </Button>
);

const BackgroundLayerGrid = ({
  layers,
  currentLayer,
  setLayer,
}: {
  layers: { value: BackgroundLayerName; label: string }[];
  currentLayer: BackgroundLayerName;
  setLayer: (layer: BackgroundLayerName) => void;
}) => (
  <SimpleGrid columns={2} justifyItems="center" gap={0} w={'inherit'}>
    {layers.map((layer) => (
      <LayerCard
        key={layer.value}
        label={layer.label}
        thumbnailUrl={`/backgroundlayerImages/${getBackgroundLayerImageName(layer.value)}.png`}
        isActive={currentLayer === layer.value}
        onClick={() => setLayer(layer.value)}
      />
    ))}
  </SimpleGrid>
);

export const BackgroundLayerSettings = ({
  onSelectComplete,
}: {
  onSelectComplete: () => void;
}) => {
  const [backgroundLayer, setBackgroundLayer] = useAtom(backgroundLayerAtom_v2);
  const { t } = useTranslation();

  const currentProjection = useAtomValue(currentProjectionAtom);

  const layersToShow = allConfiguredBackgroundLayers.filter(
    (layer) =>
      layer.showForProjections == null ||
      layer.showForProjections.includes(currentProjection),
  );

  const ph = usePostHog();

  const sortedLayers = layersToShow.sort((lc1, lc2) =>
    layerPrioritySort(lc1.layerName, lc2.layerName),
  );

  const handleSetLayer = (layer: BackgroundLayerName) => {
    ph.capture('map_background_layer_changed', { layerName: layer });
    setBackgroundLayer(layer);
    onSelectComplete();
  };

  return (
    <Box backgroundColor="#FFFF" p={2} borderRadius={10} w={'100%'}>
      <BackgroundLayerGrid
        layers={sortedLayers.map((layer) => ({
          value: layer.layerName,
          label: t(
            `map.settings.layers.mapNames.backgroundMaps.${layer.layerName}`,
          ),
        }))}
        currentLayer={backgroundLayer}
        setLayer={handleSetLayer}
      />
    </Box>
  );
};
