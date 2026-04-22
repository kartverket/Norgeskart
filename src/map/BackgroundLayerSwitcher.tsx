import {
  Box,
  Button,
  Image,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  SimpleGrid,
  Text,
  VStack,
} from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currentProjectionAtom, getBackgroundLayerImageName } from './atoms';
import { BackgroundLayerName } from './layers/backgroundLayers';
import {
  allConfiguredBackgroundLayers,
  backgroundLayerAtom,
} from './layers/config/backgroundLayers/atoms';

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
  <SimpleGrid columns={2} justifyItems="center" gap={0}>
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

export const BackgroundLayerSwitcher = () => {
  const [open, setOpen] = useState(false);
  const [backgroundLayer, setBackgroundLayer] = useAtom(backgroundLayerAtom);
  const currentProjection = useAtomValue(currentProjectionAtom);
  const { t } = useTranslation();

  const backgroundLayers = Array.from(
    new Set(
      allConfiguredBackgroundLayers
        .filter(
          (layer) =>
            layer.showForProjections == null ||
            layer.showForProjections.includes(currentProjection),
        )
        .map((layer) => layer.layerName),
    ),
  ).sort(sortBackgroundLayers);

  return (
    <PopoverRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{ placement: 'top', offset: { mainAxis: 2 } }}
    >
      <PopoverTrigger asChild>
        <Button
          pointerEvents="auto"
          width="56px"
          height="54px"
          borderRadius="10px"
          overflow="hidden"
          cursor="pointer"
          padding={0}
          position="relative"
          aria-label={'Bakgrunnskart'}
          border="2px solid"
          borderColor="white"
          boxShadow="0 2px 10px rgba(0, 0, 0, 0.35)"
        >
          <Image
            src={`/backgroundlayerImages/${getBackgroundLayerImageName(backgroundLayer)}.png`}
            alt={t(
              `map.settings.layers.mapNames.backgroundMaps.${backgroundLayer}`,
            )}
            width="100%"
            height="100%"
            objectFit="cover"
          />
          <Box position="absolute" inset={0} bg="rgba(0, 0, 0, 0.16)" />
          <Box
            position="absolute"
            left={0}
            right={0}
            bottom={0}
            px={1.5}
            py={0.5}
            bg="rgba(0, 0, 0, 0.68)"
          >
            <Text
              color="white"
              fontSize="10px"
              fontWeight="semibold"
              textAlign="center"
              lineHeight="short"
            >
              Kart
            </Text>
          </Box>
        </Button>
      </PopoverTrigger>
      <PopoverContent width="350px" p={0} borderRadius="2xl" boxShadow="lg">
        <PopoverArrow />
        <PopoverBody p={0} maxHeight="420px" overflowY="auto">
          <Box p={1}>
            <BackgroundLayerGrid
              layers={backgroundLayers.map((layerName) => ({
                value: layerName,
                label: t(
                  `map.settings.layers.mapNames.backgroundMaps.${layerName}`,
                ),
              }))}
              currentLayer={backgroundLayer}
              setLayer={(layerName) => {
                setBackgroundLayer(layerName);
                setOpen(false);
              }}
            />
          </Box>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};
