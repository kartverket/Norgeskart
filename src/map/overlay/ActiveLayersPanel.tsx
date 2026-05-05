import { Box, HStack, Stack, Text } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { urlGeoJsonLayersAtom } from '../layers/urlGeoJson';
import { hasUrlLayersAtom, urlWmsLayersAtom } from '../layers/urlWms';

const LayerIndicatorRow = ({
  title,
  color,
}: {
  title: string;
  color: 'blue' | 'green';
}) => (
  <HStack gap={2} align="center">
    <Box
      w={3}
      h={3}
      borderRadius="sm"
      bg={`${color}.100`}
      border="2px solid"
      borderColor={`${color}.400`}
      flexShrink={0}
    />
    <Text fontSize="xs" lineClamp={1} title={title}>
      {title}
    </Text>
  </HStack>
);

export const ActiveLayersPanel = () => {
  const { t } = useTranslation();
  const hasUrlLayers = useAtomValue(hasUrlLayersAtom);
  const wmsLayers = useAtomValue(urlWmsLayersAtom);
  const geoJsonLayers = useAtomValue(urlGeoJsonLayersAtom);

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
        {wmsLayers.map((layer) => (
          <LayerIndicatorRow
            key={layer.get('id') as string}
            title={layer.get('layerTitle') as string}
            color="blue"
          />
        ))}
        {geoJsonLayers.map((layer) => (
          <LayerIndicatorRow
            key={layer.get('id') as string}
            title={layer.get('layerTitle') as string}
            color="green"
          />
        ))}
      </Stack>
    </Box>
  );
};
