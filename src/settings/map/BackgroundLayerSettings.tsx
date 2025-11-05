import { Box, Heading, Image, SimpleGrid } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../map/atoms';
import { BackgroundLayerName } from '../../map/layers/backgroundLayers';
import { WMSLayerName } from '../../map/layers/backgroundWMS';
import {
  DEFAULT_BACKGROUND_LAYER,
  loadableWMTS,
} from '../../map/layers/backgroundWMTSProviders';
import { useMapSettings } from '../../map/mapHooks';
import { getUrlParameter } from '../../shared/utils/urlUtils';

// Prioritetskart for sortering
const layerPriorityMap = new Map<BackgroundLayerName, number>([
  ['topo', 1],
  ['topograatone', 2],
  ['toporaster', 3],
  ['sjokartraster', 4],
  ['oceanicelectronic', 5],
  ['Nibcache_web_mercator_v2', 6],
  ['Nibcache_UTM32_EUREF89_v2', 7],
  ['Nibcache_UTM33_EUREF89_v2', 8],
  ['Nibcache_UTM35_EUREF89_v2', 8],
]);

const layerPrioritySort = (
  a: { value: BackgroundLayerName; label: string },
  b: { value: BackgroundLayerName; label: string },
) => {
  const priorityA = layerPriorityMap.get(a.value) || 0;
  const priorityB = layerPriorityMap.get(b.value) || 0;
  return priorityA - priorityB;
};

// Komponent for hvert lagkort
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
  <Box
    cursor="pointer"
    borderWidth={isActive ? 2 : 1}
    borderColor={isActive ? 'blue.500' : 'gray.200'}
    borderRadius="md"
    overflow="hidden"
    position="relative"
    onClick={onClick}
    _hover={{ borderColor: 'blue.400' }}
  >
    <Image
      src={thumbnailUrl}
      alt={label}
      width="150px"
      height="100px"
      objectFit="cover"
    />
    <Box
      position="absolute"
      bottom={0}
      width="100%"
      bg="rgba(0,0,0,0.5)"
      color="white"
      textAlign="center"
      fontSize="sm"
      py={1}
      opacity={0}
      _hover={{ opacity: 1 }}
      transition="opacity 0.2s"
    >
      {label}
    </Box>
  </Box>
);

// Grid for alle lagene
const BackgroundLayerGrid = ({
  layers,
  currentLayer,
  setLayer,
}: {
  layers: { value: BackgroundLayerName; label: string }[];
  currentLayer: BackgroundLayerName;
  setLayer: (layer: BackgroundLayerName) => void;
}) => (
  <SimpleGrid columns={3} gap={2}>
    {layers.map((layer) => (
      <LayerCard
        key={layer.value}
        label={layer.label}
        thumbnailUrl={`/backgroundlayerImages/${layer.value}.png`}
        isActive={currentLayer === layer.value}
        onClick={() => setLayer(layer.value)}
      />
    ))}
  </SimpleGrid>
);

// Hovedkomponent
export const BackgroundLayerSettings = () => {
  const { t } = useTranslation();
  const { setBackgroundLayer, getMapProjectionCode } = useMapSettings();
  const WMTSProviders = useAtomValue(loadableWMTS);
  const map = useAtomValue(mapAtom);

  if (WMTSProviders.state !== 'hasData') {
    return null;
  }

  const projectionCode = getMapProjectionCode();
  const providers = WMTSProviders.data.keys();

  // Get current background layer from map
  const currentBackgroundLayer = map
    .getAllLayers()
    .find((l) => l.get('id')?.startsWith('bg.'));

  const currentLayerId = currentBackgroundLayer?.get('id');
  let currentLayer: BackgroundLayerName = DEFAULT_BACKGROUND_LAYER;

  if (currentLayerId) {
    // Extract layer name from id (format is "bg.layername")
    currentLayer = currentLayerId.substring(3) as BackgroundLayerName;
  } else {
    // Fallback to URL parameter if no layer on map yet
    const layerFromUrl = getUrlParameter(
      'backgroundLayer',
    ) as BackgroundLayerName;
    currentLayer = layerFromUrl || DEFAULT_BACKGROUND_LAYER;
  }

  const avaiableLayers: { value: BackgroundLayerName; label: string }[] = [];

  for (const providerId of providers) {
    const projectionLayersIterator = WMTSProviders.data
      .get(providerId)
      ?.get(projectionCode)
      ?.keys();
    const projectionLayerNames = Array.from(projectionLayersIterator || []);

    const avaialbeLayersForProvider = projectionLayerNames.map((layerName) => ({
      value: layerName,
      label: t(`map.settings.layers.mapNames.backgroundMaps.${layerName}`),
    }));

    avaiableLayers.push(...avaialbeLayersForProvider);
  }

  // Legg til WMS-laget "oceanicelectronic"
  avaiableLayers.push({
    value: 'oceanicelectronic' as WMSLayerName,
    label: t(`map.settings.layers.mapNames.backgroundMaps.oceanicelectronic`),
  });

  const sortedLayers = avaiableLayers.sort(layerPrioritySort);

  return (
    <Box>
      <Heading size="lg" mb={2}>
        {t('map.settings.layers.background.label')}
      </Heading>
      <BackgroundLayerGrid
        layers={sortedLayers}
        currentLayer={currentLayer}
        setLayer={setBackgroundLayer}
      />
    </Box>
  );
};
