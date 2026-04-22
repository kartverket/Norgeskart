import { Box, Button, Image, SimpleGrid, Text, VStack } from '@kvib/react';
import { getBackgroundLayerImageName } from '../atoms';
import { BackgroundLayerName } from '../layers/backgroundLayers';
import { allConfiguredBackgroundLayers } from '../layers/config/backgroundLayers/atoms';
import { ProjectionIdentifier } from '../projections/types';

const backgroundLayerOrder = new Map<BackgroundLayerName, number>([
  ['topo', 1],
  ['topograatone', 2],
  ['toporaster', 3],
  ['sjokartraster', 4],
  ['nautical-background', 5],
  ['Nibcache_web_mercator_v2', 6],
  ['Nibcache_UTM32_EUREF89_v2', 7],
  ['Nibcache_UTM33_EUREF89_v2', 8],
  ['Nibcache_UTM35_EUREF89_v2', 9],
  ['Basisdata_NP_Basiskart_Svalbard_WMTS_25833', 10],
  ['Basisdata_NP_Basiskart_JanMayen_WMTS_25833', 11],
]);

const sortBackgroundLayers = (
  a: BackgroundLayerName,
  b: BackgroundLayerName,
) => {
  const priorityA = backgroundLayerOrder.get(a) ?? Number.MAX_SAFE_INTEGER;
  const priorityB = backgroundLayerOrder.get(b) ?? Number.MAX_SAFE_INTEGER;
  if (priorityA !== priorityB) return priorityA - priorityB;
  return a.localeCompare(b);
};

export const getAvailableBackgroundLayers = (
  currentProjection: ProjectionIdentifier,
) =>
  allConfiguredBackgroundLayers
    .filter(
      (layer) =>
        layer.showForProjections == null ||
        layer.showForProjections.includes(currentProjection),
    )
    .map((layer) => layer.layerName)
    .sort(sortBackgroundLayers);

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

export const BackgroundLayerGrid = ({
  layers,
  currentLayer,
  setLayer,
  width,
}: {
  layers: { value: BackgroundLayerName; label: string }[];
  currentLayer: BackgroundLayerName;
  setLayer: (layer: BackgroundLayerName) => void;
  width?: string;
}) => (
  <SimpleGrid columns={2} justifyItems="center" gap={0} w={width}>
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
