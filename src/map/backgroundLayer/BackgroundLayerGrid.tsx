import {
  Badge,
  Box,
  Button,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { getBackgroundLayerImageName } from '../atoms';
import { BackgroundLayerName } from '../layers/backgroundLayers';
import { newBackgroundLayers } from './utils';

interface LayerCardProps {
  label: string;
  thumbnailUrl: string;
  isActive?: boolean;
  isNew?: boolean;
  onClick: () => void;
}

const LayerCard = ({
  label,
  thumbnailUrl,
  isActive,
  isNew,
  onClick,
}: LayerCardProps) => {
  const { t } = useTranslation();
  return (
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
      position="relative"
    >
      {isNew && (
        <Badge
          colorPalette="green"
          variant="solid"
          size="sm"
          position="absolute"
          top={1}
          right={1}
        >
          {t('map.controls.backgroundLayer.new')}
        </Badge>
      )}
      <VStack>
        <Box width="46px" height="46px" borderRadius="md" overflow="hidden">
          <Image
            src={thumbnailUrl}
            alt={label}
            width="100%"
            objectFit="cover"
          />
        </Box>
        <Text fontSize="xs" textAlign="center" lineHeight="short">
          {label}
        </Text>
      </VStack>
    </Button>
  );
};

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
        isNew={newBackgroundLayers.has(layer.value)}
        onClick={() => setLayer(layer.value)}
      />
    ))}
  </SimpleGrid>
);
