import {
  Box,
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  Flex,
  Heading,
  Icon,
  Switch,
  Text,
  Tooltip,
} from '@kvib/react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MAX_THEME_LAYERS,
  useThemeLayers,
} from '../../../map/layers/themeLayers';
import { ThemeLayerName } from '../../../map/layers/themeWMS';
import { SubTheme, ThemeLayer } from './types';

export const SubThemeSection = ({
  subTheme,
  toggleLayer,
  defaultOpen = false,
}: {
  subTheme: SubTheme;
  toggleLayer: (layerName: ThemeLayerName) => void;
  defaultOpen?: boolean;
}) => {
  const { activeLayerSet, removeThemeLayerFromMap } =
    useThemeLayers();

  const { t } = useTranslation();
  const id = useId();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const subthemeLayerNames = subTheme.layers.map((layer) => layer.name);
  const activeCount = activeLayerSet.size;

  const activeInSubTheme = Array.from(activeLayerSet.values()).filter(
    (layerName) => subTheme.layers.some((layer) => layer.name === layerName),
  ).length;
  const totalInSubTheme = subTheme.layers.length;
  const isLayerChecked = (layerName: ThemeLayerName) =>
    activeLayerSet.has(layerName);

  return (
    <Box key={subTheme.name} marginBottom={2}>
      {subTheme.layers.length == 1 ? (
        <LayerLine
          toggleLayer={toggleLayer}
          layer={subTheme.layers[0]}
          checked={isLayerChecked(subTheme.layers[0].name)}
          disabled={
            !isLayerChecked(subTheme.layers[0].name) &&
            activeCount >= MAX_THEME_LAYERS
          }
        />
      ) : (
        <CollapsibleRoot
          open={isOpen}
          onOpenChange={(e) => setIsOpen(e.open)}
          m={0}
        >
          <CollapsibleTrigger w={'100%'}>
            <Flex justify={'space-between'} cursor={'pointer'}>
              <Heading fontWeight={'600'} size={{ base: 'xs', md: 'sm' }}>
                {subTheme.heading}
              </Heading>
              <Flex>
                {subTheme.disableToggleAll || totalInSubTheme === 1 ? null : (
                  <Tooltip
                    content={
                      activeInSubTheme === totalInSubTheme
                        ? t(
                          'map.settings.layers.theme.subtheme.toggleall.removeall',
                        )
                        : t(
                          'map.settings.layers.theme.subtheme.toggleall.addall',
                        )
                    }
                    ids={{ trigger: id }}
                  >
                    <Switch
                      colorPalette="green"
                      size="xs"
                      checked={activeInSubTheme === totalInSubTheme}
                      ids={{ root: id }}
                      onCheckedChange={(e) => {
                        if (e.checked) {
                          subthemeLayerNames
                            .filter(layerName => !activeLayerSet.has(layerName))
                            .forEach(toggleLayer);
                        } else {
                          removeThemeLayerFromMap(subthemeLayerNames);
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  </Tooltip>
                )}
                <Box transform={isOpen ? 'rotate(-90deg)' : 'rotate(90deg)'}>
                  <Icon
                    icon={'chevron_forward'}
                    rotate={'90deg'}
                    transform={'rotate(120deg)'}
                  />
                </Box>
              </Flex>
            </Flex>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {subTheme.layers.map((layer) => (
              <LayerLine
                toggleLayer={toggleLayer}
                layer={layer}
                checked={isLayerChecked(layer.name)}
                disabled={
                  !isLayerChecked(layer.name) && activeCount >= MAX_THEME_LAYERS
                }
              />
            ))}
          </CollapsibleContent>
        </CollapsibleRoot>
      )}
    </Box>
  );
};

export const LayerLine = ({
  toggleLayer,
  layer,
  checked,
  disabled,
}: {
  toggleLayer: (layerName: ThemeLayerName) => void;
  layer: ThemeLayer;
  checked: boolean;
  disabled: boolean;
}) => {
  return (
    <Flex
      key={layer.name}
      justifyContent="space-between"
      paddingTop={2}
      onClick={() => toggleLayer(layer.name)}
      cursor="pointer"
    >
      <Text fontSize={{ base: 'xs', md: 'sm' }}>{layer.label}</Text>
      <Switch
        marginRight={'24px'}
        colorPalette="green"
        size="xs"
        checked={checked}
        disabled={disabled}
      />
    </Flex>
  );
};
