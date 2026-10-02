import { Box, Button, Image, SimpleGrid, Text, VStack } from '@kvib/react';
import { getBackgroundLayerImageName } from '../atoms';
import { BackgroundLayerName } from '../layers/backgroundLayers';

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
    borderWidth="2px"
    borderColor={isActive ? 'green.600' : 'transparent'}
    backgroundColor={isActive ? 'green.50' : 'transparent'}
    _hover={{ backgroundColor: 'green.50' }}
    borderRadius="md"
    width="72px"
    height="64px"
    padding={1}
    aria-label={label}
  >
    <VStack gap={1} width="100%">
      <Box width="56px" height="34px" borderRadius="sm" overflow="hidden">
        <Image
          src={thumbnailUrl}
          alt={label}
          width="100%"
          height="100%"
          objectFit="cover"
        />
      </Box>
      <Text fontSize="xs" textAlign="center" lineHeight="short" truncate>
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
  columns = 2,
}: {
  layers: { value: BackgroundLayerName; label: string }[];
  currentLayer: BackgroundLayerName;
  setLayer: (layer: BackgroundLayerName) => void;
  width?: string;
  columns?: number;
}) => (
  <SimpleGrid columns={columns} justifyItems="center" gap={0} w={width}>
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
