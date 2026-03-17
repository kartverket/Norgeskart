import {
  Box,
  Button,
  Image,
  SimpleGrid,
  Text,
  toaster,
  VStack,
} from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { transform, transformExtent } from 'ol/proj';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  currentProjectionAtom,
  DEFAULT_CENTER,
  DEFAULT_ZOOM_LEVEL,
  getBackgroundLayerImageName,
  mapAtom,
} from '../../map/atoms';
import {
  activeBackgroundLayerAtom,
  preNauticalProjectionAtom,
} from '../../map/layers/atoms.ts';
import { BackgroundLayerName } from '../../map/layers/backgroundLayers';
import { WMSLayerName } from '../../map/layers/backgroundWMS';
import {
  DEFAULT_BACKGROUND_LAYER,
  loadableWMTS,
} from '../../map/layers/backgroundWMTSProviders';
import { useMapSettings } from '../../map/mapHooks';
import { getUrlParameter } from '../../shared/utils/urlUtils';
import { BackgroundSelector2 } from './BackgroundSelector2.tsx';

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

const layerPrioritySort = (
  a: { value: BackgroundLayerName; label: string },
  b: { value: BackgroundLayerName; label: string },
) => {
  const priorityA = layerPriorityMap.get(a.value) || 0;
  const priorityB = layerPriorityMap.get(b.value) || 0;
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
  const { t } = useTranslation();
  const { setBackgroundLayer } = useMapSettings();
  const currentProjection = useAtomValue(currentProjectionAtom);
  const setCurrentProjection = useSetAtom(currentProjectionAtom);
  const WMTSProviders = useAtomValue(loadableWMTS);
  const map = useAtomValue(mapAtom);
  const ph = usePostHog();
  const setActiveBackgroundLayer = useSetAtom(activeBackgroundLayerAtom);
  const [preNauticalProjection, setPreNauticalProjection] = useAtom(
    preNauticalProjectionAtom,
  );

  const initialLayer: BackgroundLayerName = (() => {
    const currentBackgroundLayer = map
      .getAllLayers()
      .find((l) => l.get('id')?.startsWith('bg.'));

    const currentLayerId = currentBackgroundLayer?.get('id');

    if (currentLayerId) {
      return currentLayerId.substring(3) as BackgroundLayerName;
    }

    const layerFromUrl = getUrlParameter(
      'backgroundLayer',
    ) as BackgroundLayerName;
    return layerFromUrl || DEFAULT_BACKGROUND_LAYER;
  })();

  const [currentLayer, setCurrentLayer] =
    useState<BackgroundLayerName>(initialLayer);
  useEffect(() => {
    setActiveBackgroundLayer(initialLayer);
  }, [initialLayer, setActiveBackgroundLayer]);

  if (WMTSProviders.state !== 'hasData') {
    return null;
  }

  const providers = WMTSProviders.data.keys();

  const avaiableLayers: { value: BackgroundLayerName; label: string }[] = [];

  for (const providerId of providers) {
    const projectionLayersIterator = WMTSProviders.data
      .get(providerId)
      ?.get(currentProjection)
      ?.keys();

    const projectionLayerNames = Array.from(projectionLayersIterator || []);

    const avaialbeLayersForProvider = projectionLayerNames.map((layerName) => ({
      value: layerName,
      label: t(`map.settings.layers.mapNames.backgroundMaps.${layerName}`),
    }));

    avaiableLayers.push(...avaialbeLayersForProvider);
  }

  avaiableLayers.push({
    value: 'oceanicelectronic' as WMSLayerName,
    label: t(`map.settings.layers.mapNames.backgroundMaps.oceanicelectronic`),
  });

  // Add vector tile layers
  avaiableLayers.push({
    value: 'nautical-background',
    label: t(`map.settings.layers.mapNames.backgroundMaps.nautical-background`),
  });

  const sortedLayers = avaiableLayers.sort(layerPrioritySort);

  const handleSetLayer = (layer: BackgroundLayerName) => {
    ph.capture('map_background_layer_changed', { layerName: layer });

    // Switching away from nautical: restore previous projection
    if (
      currentLayer === 'nautical-background' &&
      layer !== 'nautical-background' &&
      preNauticalProjection &&
      preNauticalProjection !== currentProjection
    ) {
      setPreNauticalProjection(null);
      setCurrentLayer(layer);
      setActiveBackgroundLayer(layer);
      setCurrentProjection(preNauticalProjection);
      onSelectComplete();
      return;
    }

    setCurrentLayer(layer);
    setActiveBackgroundLayer(layer);

    // Switching to nautical: save current projection and force Web Mercator
    if (layer === 'nautical-background' && currentProjection !== 'EPSG:3857') {
      setPreNauticalProjection(currentProjection);
      setCurrentProjection('EPSG:3857');
      toaster.create({
        title: t('map.settings.layers.projection.forcedWebMercator'),
        duration: 4000,
        type: 'info',
      });
      onSelectComplete();
      return;
    }

    setBackgroundLayer(layer);
    setCurrentLayer(layer);
    setActiveBackgroundLayer(layer);

    const polarExtent = POLAR_LAYER_EXTENTS[layer];
    if (polarExtent) {
      const targetExtent = transformExtent(
        polarExtent,
        'EPSG:25833',
        map.getView().getProjection(),
      );
      map
        .getView()
        .fit(targetExtent, { duration: 500, padding: [50, 50, 50, 50] });
    } else if (POLAR_LAYER_EXTENTS[currentLayer]) {
      const norwayCenter = transform(
        DEFAULT_CENTER,
        'EPSG:25833',
        map.getView().getProjection(),
      );
      map.getView().animate({
        center: norwayCenter,
        zoom: DEFAULT_ZOOM_LEVEL,
        duration: 500,
      });
    }

    onSelectComplete();
  };

  return (
    <Box backgroundColor="#FFFF" p={2} borderRadius={10} w={'100%'}>
      <BackgroundLayerGrid
        layers={sortedLayers}
        currentLayer={currentLayer}
        setLayer={handleSetLayer}
      />
      <BackgroundSelector2 />
    </Box>
  );
};
