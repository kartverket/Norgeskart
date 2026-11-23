import { Box, Button, Checkbox, Spinner, Text, VStack } from '@kvib/react';
import { useSetAtom } from 'jotai';
import type TileLayer from 'ol/layer/Tile';
import type { TileWMS } from 'ol/source';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  combinedScaleRange,
  fetchWmsCapabilities,
  getWmsBaseUrl,
  getWmsLayerNames,
  layersForLeaves,
  leafNodes,
  selectedLeaves,
  urlWmsLayersAtom,
  WmsLayerNode,
} from '../../../map/layers/urlWms';

const withDepth = (
  node: WmsLayerNode,
  depth = 0,
): { node: WmsLayerNode; depth: number }[] => [
  { node, depth },
  ...node.children.flatMap((child) => withDepth(child, depth + 1)),
];

export const WmsLayerPicker = ({ layer }: { layer: TileLayer }) => {
  const { t } = useTranslation();
  const setUrlWmsLayers = useSetAtom(urlWmsLayersAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [root, setRoot] = useState<WmsLayerNode | null>(null);
  const [hasError, setHasError] = useState(false);

  const toggleOpen = async () => {
    setIsOpen(!isOpen);
    if (isOpen || root) return;
    setHasError(false);
    try {
      setRoot(await fetchWmsCapabilities(getWmsBaseUrl(layer)));
    } catch {
      setHasError(true);
    }
  };

  const selected = root
    ? selectedLeaves(root, getWmsLayerNames(layer))
    : new Set<string>();

  const toggle = (node: WmsLayerNode, checked: boolean) => {
    if (!root) return;
    const next = new Set(selected);
    for (const leaf of leafNodes(node)) {
      if (checked) next.add(leaf.name as string);
      else next.delete(leaf.name as string);
    }
    if (next.size === 0) return; // LAYERS can't be empty; remove the layer instead
    (layer.getSource() as TileWMS).updateParams({
      LAYERS: layersForLeaves(root, next).join(','),
    });
    const leaves = leafNodes(root).filter((n) => next.has(n.name as string));
    layer.set('scaleRange', combinedScaleRange(leaves));
    // New array: redraws list and legend, and updates the URL.
    setUrlWmsLayers((prev) => [...prev]);
  };

  return (
    <Box marginTop={2}>
      <Button
        size="xs"
        variant="ghost"
        aria-expanded={isOpen}
        leftIcon={isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
        onClick={() => void toggleOpen()}
      >
        {t('map.settings.layers.theme.addWms.pickLayers')}
      </Button>
      {isOpen && (
        <Box maxH="240px" overflowY="auto" aria-live="polite">
          {hasError && (
            <Text fontSize="xs">
              {t('map.settings.layers.theme.addWms.pickLayersError')}
            </Text>
          )}
          {!root && !hasError && <Spinner size="xs" />}
          {root && (
            <VStack align="stretch" gap={1}>
              {withDepth(root)
                .filter(({ node }) => leafNodes(node).length > 0)
                .map(({ node, depth }, i) => {
                  const leaves = leafNodes(node);
                  const on = leaves.filter((l) =>
                    selected.has(l.name as string),
                  ).length;
                  const isAll = on === leaves.length;
                  return (
                    <Checkbox
                      key={`${i}-${node.name ?? node.title}`}
                      size="sm"
                      paddingLeft={depth * 4}
                      checked={isAll ? true : on > 0 ? 'indeterminate' : false}
                      disabled={isAll && on === selected.size}
                      onCheckedChange={({ checked }) =>
                        toggle(node, checked === true)
                      }
                    >
                      {node.title}
                    </Checkbox>
                  );
                })}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
};
