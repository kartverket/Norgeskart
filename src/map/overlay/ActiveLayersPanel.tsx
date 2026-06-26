import { Box, HStack, Stack, Switch, Text } from '@kvib/react';
import { useAtomValue } from 'jotai';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';
import type TileLayer from 'ol/layer/Tile';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { urlGeoJsonLayersAtom } from '../layers/urlGeoJson';
import { hasUrlLayersAtom, urlWmsLayersAtom } from '../layers/urlWms';

type AnyLayer = TileLayer | VectorLayer<VectorSource<Feature<Geometry>>>;

const LayerIndicatorRow = ({
  title,
  visible,
  onToggle,
}: {
  title: string;
  visible: boolean;
  onToggle: () => void;
}) => (
  <HStack gap={2} align="center" onClick={onToggle} cursor="pointer">
    <Text
      fontSize="xs"
      lineClamp={1}
      title={title}
      flex={1}
    >
      {title}
    </Text>
    <Switch
      colorPalette="green"
      size="xs"
      checked={visible}
    />
  </HStack>
);

const useLayerVisibility = (layers: AnyLayer[]) => {
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        layers.map((l) => [l.get('id') as string, l.getVisible()]),
      ),
  );

  const toggle = (layer: AnyLayer) => {
    const id = layer.get('id') as string;
    const next = !(visibilityMap[id] ?? layer.getVisible());
    layer.setVisible(next);
    setVisibilityMap((prev) => ({ ...prev, [id]: next }));
  };

  return { visibilityMap, toggle };
};

export const ActiveLayersPanel = () => {
  const { t } = useTranslation();
  const hasUrlLayers = useAtomValue(hasUrlLayersAtom);
  const wmsLayers = useAtomValue(urlWmsLayersAtom);
  const geoJsonLayers = useAtomValue(urlGeoJsonLayersAtom);

  const { visibilityMap: wmsVisibility, toggle: toggleWms } =
    useLayerVisibility(wmsLayers);
  const { visibilityMap: geoJsonVisibility, toggle: toggleGeoJson } =
    useLayerVisibility(geoJsonLayers);

  if (!hasUrlLayers) return null;

  return (
    <Box
      bg="white"
      borderRadius="xl"
      px={3}
      py={2}
      shadow="lg"
      maxW="200px"
      pointerEvents="auto"
    >
      <Text fontSize="xs" fontWeight="semibold" color="gray.600" mb={1}>
        {t('activeLayers.title')}
      </Text>
      <Stack gap={1}>
        {wmsLayers.map((layer) => {
          const id = layer.get('id') as string;
          return (
            <LayerIndicatorRow
              key={id}
              title={layer.get('layerTitle') as string}
              visible={wmsVisibility[id] ?? true}
              onToggle={() => toggleWms(layer)}
            />
          );
        })}
        {geoJsonLayers.map((layer) => {
          const id = layer.get('id') as string;
          return (
            <LayerIndicatorRow
              key={id}
              title={layer.get('layerTitle') as string}
              visible={geoJsonVisibility[id] ?? true}
              onToggle={() => toggleGeoJson(layer)}
            />
          );
        })}
      </Stack>
    </Box>
  );
};
