import {
  Box,
  Button,
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
import {
  assignZIndices,
  resolutionForWmsScale,
  scaleRangeStatus,
  urlWmsLayersAtom,
  useWmsScale,
  WmsScaleRange,
} from '../../../map/layers/urlWms';
import { GeonorgeWmsSearch } from './GeonorgeWmsSearch';

// ─── Layer list ──────────────────────────────────────────────────────────────

const WmsLayerList = () => {
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const setUrlWmsLayers = useSetAtom(urlWmsLayersAtom);
  const urlWmsLayers = useAtomValue(urlWmsLayersAtom);
  const wmsScale = useWmsScale(map);

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

  // Zoom just inside the layer's range (10 % margin) so it actually draws.
  const zoomIntoRange = (
    range: WmsScaleRange,
    status: 'zoomIn' | 'zoomOut',
  ) => {
    const target =
      status === 'zoomIn' ? range.maxScale! * 0.9 : range.minScale! * 1.1;
    map.getView().animate({
      resolution: resolutionForWmsScale(map, target),
      duration: 300,
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
        const serviceTitle = layer.get('serviceTitle') as string | undefined;
        const opacity = opacities[id] ?? layer.getOpacity();
        const detailsUrl = layer.get('geonorgeDetailsUrl') as
          string | undefined;
        const isFirst = index === 0;
        const isLast = index === urlWmsLayers.length - 1;
        const scaleRange = (layer.get('scaleRange') ?? {}) as WmsScaleRange;
        const scaleStatus = scaleRangeStatus(wmsScale, scaleRange);

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

              <Box flex={1} minW={0}>
                <Text
                  fontSize="xs"
                  fontWeight="medium"
                  lineClamp={1}
                  title={title}
                >
                  {title}
                </Text>
                {/* Which WMS the layer comes from, unless it is the service. */}
                {serviceTitle && serviceTitle !== title && (
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    lineClamp={1}
                    title={serviceTitle}
                  >
                    {t('map.settings.layers.theme.addWms.fromService', {
                      service: serviceTitle,
                    })}
                  </Text>
                )}
              </Box>

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

            {scaleStatus !== 'visible' && (
              <Flex align="center" gap={2} mb={2} aria-live="polite">
                <Text fontSize="xs" color="gray.600" flex={1}>
                  {t(`map.settings.layers.theme.addWms.${scaleStatus}Hint`, {
                    scale: Math.round(
                      scaleStatus === 'zoomIn'
                        ? scaleRange.maxScale!
                        : scaleRange.minScale!,
                    ).toLocaleString('nb-NO'),
                  })}
                </Text>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => zoomIntoRange(scaleRange, scaleStatus)}
                >
                  {t(`map.settings.layers.theme.addWms.${scaleStatus}Button`)}
                </Button>
              </Flex>
            )}

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
