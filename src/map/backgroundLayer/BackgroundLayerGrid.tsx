import {
  Box,
  Button,
  Image,
  SimpleGrid,
  Text,
  Tooltip,
  VStack,
} from '@kvib/react';
import { getBackgroundLayerImageName } from '../atoms';
import { BackgroundLayerName } from '../layers/backgroundLayers';

interface LayerCardProps {
  label: string;
  shortLabel?: string;
  thumbnailUrl: string;
  isActive?: boolean;
  onClick: () => void;
}

const LayerCardButton = ({
  label,
  shortLabel,
  thumbnailUrl,
  isActive,
  onClick,
}: LayerCardProps) => {
  return (
    <Button
      variant="ghost"
      colorPalette="green"
      width="fit-content"
      height="64px"
      display="inline-flex"
      alignSelf="center"
      backgroundColor="transparent"
      _hover={{ backgroundColor: 'transparent' }}
      p={0}
      onClick={onClick}
      aria-label={label}
    >
      <Box
        backgroundColor={isActive ? '#D0ECD6' : 'transparent'}
        _hover={{ backgroundColor: '#D0ECD6' }}
        borderRadius="md"
        width="84px"
        height="64px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap={1}>
          <Box width="48px" height="30px" borderRadius="4px" overflow="hidden">
            <Image
              src={thumbnailUrl}
              alt={label}
              width="100%"
              height="100%"
              objectFit="cover"
            />
          </Box>
          <Text fontSize="14px" textAlign="center" lineHeight="short" truncate>
            {shortLabel ?? label}
          </Text>
        </VStack>
      </Box>
    </Button>
  );
};

const LayerCard = (props: LayerCardProps) => {
  const { label, shortLabel } = props;

  if (!shortLabel || shortLabel === label) {
    return <LayerCardButton {...props} />;
  }

  return (
    <Tooltip
      content={label}
      portalled={false}
      positioning={{ placement: 'right' }}
    >
      <Box display="inline-flex">
        <LayerCardButton {...props} />
      </Box>
    </Tooltip>
  );
};

export const BackgroundLayerGrid = ({
  layers,
  currentLayer,
  setLayer,
  width,
  columns = 2,
  showMoreButton = false,
  onMoreClick,
}: {
  layers: {
    value: BackgroundLayerName;
    label: string;
    shortLabel?: string;
  }[];
  currentLayer: BackgroundLayerName;
  setLayer: (layer: BackgroundLayerName) => void;
  width?: string;
  columns?: number;
  showMoreButton?: boolean;
  onMoreClick?: () => void;
}) => (
  <SimpleGrid
    columns={columns}
    justifyItems="center"
    gridAutoRows="64px"
    rowGap={0}
    columnGap={0}
    w={width}
  >
    {layers.map((layer) => (
      <LayerCard
        key={layer.value}
        label={layer.label}
        shortLabel={layer.shortLabel}
        thumbnailUrl={`/backgroundlayerImages/${getBackgroundLayerImageName(layer.value)}.png`}
        isActive={currentLayer === layer.value}
        onClick={() => setLayer(layer.value)}
      />
    ))}
    {showMoreButton && (
      <Button
        variant="ghost"
        colorPalette="green"
        width="fit-content"
        height="64px"
        display="inline-flex"
        alignSelf="center"
        backgroundColor="transparent"
        _hover={{ backgroundColor: 'transparent' }}
        p={0}
        onClick={onMoreClick}
        aria-label="Vis flere kart"
        title="Vis flere kart"
      >
        <Box
          backgroundColor="transparent"
          _hover={{ backgroundColor: '#D0ECD6' }}
          borderRadius="md"
          width="84px"
          height="64px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={0}
          py={0}
        >
          <VStack gap={1}>
            <Text fontSize="14px">Mer</Text>
          </VStack>
        </Box>
      </Button>
    )}
  </SimpleGrid>
);
