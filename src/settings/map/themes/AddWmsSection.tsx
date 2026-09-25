import {
  Box,
  Flex,
  IconButton,
  Link,
  Slider,
  Text,
  Tooltip,
  VStack,
} from '@kvib/react';
import { useAtomValue, useSetAtom } from 'jotai';
import type TileLayer from 'ol/layer/Tile';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../../map/atoms';
import { assignZIndices, urlWmsLayersAtom } from '../../../map/layers/urlWms';
import { GeonorgeWmsSearch } from './GeonorgeWmsSearch';

// ─── Layer list ──────────────────────────────────────────────────────────────

const WmsLayerList = () => {
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const setUrlWmsLayers = useSetAtom(urlWmsLayersAtom);
  const urlWmsLayers = useAtomValue(urlWmsLayersAtom);

  // Opacity is tracked in React state because OL layer doesn't notify React.
  const [opacities, setOpacities] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      urlWmsLayers.map((l) => [l.get('id') as string, l.getOpacity()]),
    ),
  );

  if (urlWmsLayers.length === 0) return null;

  const handleOpacity = (id: string, layer: TileLayer, value: number) => {
    layer.setOpacity(value);
    setOpacities((prev) => ({ ...prev, [id]: value }));
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= urlWmsLayers.length) return;
    setUrlWmsLayers((prev) => {
      const reordered = [...prev];
      [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
      assignZIndices(reordered);
      return reordered;
    });
  };

  const handleRemove = (index: number) => {
    const layer = urlWmsLayers[index];
    map.removeLayer(layer);
    setUrlWmsLayers((prev) => {
      const next = prev.filter((_, i) => i !== index);
      assignZIndices(next);
      return next;
    });
  };

  return (
    <VStack align="stretch" gap={2} marginTop={3}>
      {urlWmsLayers.map((layer, index) => {
        const id = layer.get('id') as string;
        const title = layer.get('layerTitle') as string;
        const opacity = opacities[id] ?? layer.getOpacity();
        const detailsUrl = layer.get('geonorgeDetailsUrl') as
          string | undefined;
        const isFirst = index === 0;
        const isLast = index === urlWmsLayers.length - 1;

        return (
          <Box
            key={id}
            borderWidth="1px"
            borderRadius="md"
            borderColor="gray.200"
            p={2}
          >
            {/* Title row */}
            <Flex align="center" gap={1} mb={2}>
              <Tooltip content={t('map.settings.layers.theme.addWms.moveUp')}>
                <IconButton
                  variant="ghost"
                  size="xs"
                  icon="arrow_upward"
                  aria-label={t('map.settings.layers.theme.addWms.moveUp')}
                  disabled={isFirst}
                  onClick={() => handleMove(index, -1)}
                />
              </Tooltip>
              <Tooltip content={t('map.settings.layers.theme.addWms.moveDown')}>
                <IconButton
                  variant="ghost"
                  size="xs"
                  icon="arrow_downward"
                  aria-label={t('map.settings.layers.theme.addWms.moveDown')}
                  disabled={isLast}
                  onClick={() => handleMove(index, 1)}
                />
              </Tooltip>

              <Text
                fontSize="xs"
                fontWeight="medium"
                flex={1}
                lineClamp={1}
                title={title}
              >
                {title}
              </Text>

              {detailsUrl && (
                <Tooltip
                  content={t('map.settings.layers.theme.addWms.geonorgeLink')}
                >
                  <Link
                    href={detailsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    lineHeight={0}
                  >
                    <IconButton
                      variant="ghost"
                      size="xs"
                      icon="open_in_new"
                      aria-label={t(
                        'map.settings.layers.theme.addWms.geonorgeLink',
                      )}
                      colorPalette="blue"
                      as="span"
                    />
                  </Link>
                </Tooltip>
              )}

              <Tooltip
                content={t('map.settings.layers.theme.addWms.removeButton')}
              >
                <IconButton
                  variant="ghost"
                  size="xs"
                  icon="delete"
                  aria-label={t(
                    'map.settings.layers.theme.addWms.removeButton',
                  )}
                  colorPalette="red"
                  onClick={() => handleRemove(index)}
                />
              </Tooltip>
            </Flex>

            {/* Opacity row */}
            <Flex align="center" gap={2}>
              <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                {t('map.settings.layers.theme.addWms.opacity')}
              </Text>
              <Box flex={1}>
                <Slider
                  size="sm"
                  min={0}
                  max={100}
                  step={1}
                  value={[Math.round(opacity * 100)]}
                  onValueChange={({ value }) =>
                    handleOpacity(id, layer, value[0] / 100)
                  }
                />
              </Box>
              <Text fontSize="xs" color="gray.500" w="30px" textAlign="right">
                {Math.round(opacity * 100)}%
              </Text>
            </Flex>
          </Box>
        );
      })}
    </VStack>
  );
};

export const AddWmsSection = () => (
  <Box>
    <GeonorgeWmsSearch />
    <WmsLayerList />
  </Box>
);
